// Supabase Edge Function: paddle-webhook
//
// Receives Paddle Billing events, verifies the signature, records the
// subscription in the `subscriptions` table (service role), and runs the
// one-time client onboarding: a private Trello request board is created and
// the client invited to it, a welcome email goes out with the Trello + Slack
// invites, and the studio is notified by email and in Slack.
//
// Handled events:
//   subscription.activated   — first payment done → upsert row + onboard once
//   subscription.created     — defensive upsert (activated normally follows)
//   subscription.updated     — status / renewal / scheduled-cancel change
//   subscription.canceled    — subscription ended
//   transaction.completed    — records txn id + actual amount on the row
//   transaction.payment_failed — renewal failed → alert the studio
//
// Onboarding is idempotent via subscriptions.onboarded_at: Paddle retries
// webhooks, and board creation + emails must run exactly once. If a step
// fails we still mark the subscription onboarded and email the studio the
// failures for manual follow-up — a retry storm creating five Trello boards
// is worse than one missed invite the studio hears about immediately.
//
// Required secrets:
//   PADDLE_API_KEY             — from Paddle → Developer tools → Authentication
//   PADDLE_WEBHOOK_SECRET      — from the Paddle notification destination
//   PADDLE_ENV                 — 'sandbox' | 'production' (default sandbox)
//   TRELLO_KEY / TRELLO_TOKEN  — https://trello.com/power-ups/admin API key +
//                                a token authorized as the studio account
//   TRELLO_WORKSPACE_ID        — optional; workspace the client boards go in
//   SLACK_WEBHOOK_URL          — optional; incoming webhook for studio alerts
//   SLACK_INVITE_URL           — optional; standing invite link clients join by
//   RESEND_API_KEY / NOTIFY_TO / NOTIFY_FROM — reused from notify-inquiry
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — provided by the platform
//
// Deploy: supabase functions deploy paddle-webhook --no-verify-jwt
// (Paddle signs the request; it does not send a Supabase JWT.)

import { createClient } from "npm:@supabase/supabase-js@2";

const TIER_LABELS: Record<string, string> = {
  lite: "Lite — $800/mo",
  standard: "Standard — $2,500/mo",
};

const STUDIO_EMAIL = "hello@13design.org";

function paddleBase(): string {
  return Deno.env.get("PADDLE_ENV") === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/**
 * Verifies a `Paddle-Signature: ts=…;h1=…` header: HMAC-SHA256 of
 * `${ts}:${rawBody}` with the endpoint secret, hex-encoded, compared
 * byte-for-byte against every h1 the header carries.
 */
async function verifyPaddleSignature(
  raw: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = new Map<string, string[]>();
  for (const kv of header.split(";")) {
    const [k, v] = kv.split("=", 2);
    if (!k || !v) continue;
    parts.set(k, [...(parts.get(k) ?? []), v]);
  }
  const ts = parts.get("ts")?.[0];
  const h1s = parts.get("h1") ?? [];
  if (!ts || h1s.length === 0) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${ts}:${raw}`),
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare against each provided h1.
  return h1s.some((h1) => {
    if (h1.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= h1.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  });
}

// ---------------------------------------------------------------------------
// Paddle API
// ---------------------------------------------------------------------------

async function paddleGet<T>(path: string): Promise<T | null> {
  const apiKey = Deno.env.get("PADDLE_API_KEY");
  if (!apiKey) {
    console.error("Missing PADDLE_API_KEY");
    return null;
  }
  const res = await fetch(`${paddleBase()}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.error(`Paddle GET ${path} failed:`, res.status, await res.text());
    return null;
  }
  return (await res.json()).data as T;
}

type PaddleCustomer = { id: string; email: string; name: string | null };

// ---------------------------------------------------------------------------
// Payload helpers (defensive: read what's there, never assume shape)
// ---------------------------------------------------------------------------

type SubPayload = {
  id: string;
  status: string;
  customer_id: string;
  currency_code?: string;
  custom_data?: { tier?: string } | null;
  current_billing_period?: { ends_at?: string } | null;
  scheduled_change?: { action?: string } | null;
  items?: { price?: { unit_price?: { amount?: string } } }[];
};

function tierOf(sub: SubPayload): string {
  return sub.custom_data?.tier ?? "";
}

function amountOf(sub: SubPayload): number | null {
  const amt = sub.items?.[0]?.price?.unit_price?.amount;
  const n = amt == null ? NaN : parseInt(amt, 10);
  return Number.isFinite(n) ? n : null;
}

function cancelScheduled(sub: SubPayload): boolean {
  return sub.scheduled_change?.action === "cancel";
}

function money(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  return `${(amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  })}`;
}

// ---------------------------------------------------------------------------
// Notifications: email (Resend) + Slack
// ---------------------------------------------------------------------------

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFY_FROM");
  if (!apiKey || !from) {
    console.error("Resend env missing; skipping email:", opts.subject);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  });
  if (!res.ok) console.error("Resend error:", res.status, await res.text());
  return res.ok;
}

function studioCard(subject: string, rows: [string, string][]): string {
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;color:#111827;font-size:14px;">${v}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f6f6f7;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #eee;">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;">13 Design Studio</div>
        <div style="font-size:18px;font-weight:600;color:#111827;margin-top:4px;">${subject}</div>
      </div>
      <div style="padding:20px 24px;"><table style="border-collapse:collapse;width:100%;">${body}</table></div>
    </div></body></html>`;
}

async function emailStudio(subject: string, rows: [string, string][]) {
  const to = Deno.env.get("NOTIFY_TO");
  if (!to) {
    console.error("NOTIFY_TO missing; skipping studio email");
    return;
  }
  await sendEmail({ to, subject, html: studioCard(subject, rows) });
}

/** Posts to the studio Slack via incoming webhook. Never throws. */
async function slackNotify(text: string) {
  const url = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) console.error("Slack webhook error:", res.status, await res.text());
  } catch (err) {
    console.error("Slack webhook error:", err);
  }
}

// ---------------------------------------------------------------------------
// Trello provisioning
// ---------------------------------------------------------------------------

const REQUEST_LIST = "📥 Design requests";
const TRELLO_LISTS = [REQUEST_LIST, "🎨 In progress", "👀 In review", "✅ Done"];

const WELCOME_CARD_TITLE = "👋 Start here — how to request design";
const WELCOME_CARD_DESC = `**Welcome to your 13 Design Studio board!**

This board is where all your design requests live. Here's how it works:

1. **Add a card** to *${REQUEST_LIST}* — one card per request.
2. In the card, tell us the **goal**, and drop in any **links** (Figma, staging, Loom) and **assets** we'll need.
3. Order the list by priority — **we always start from the top.**
4. We move cards across the board as we work: *In progress* → *In review* → *Done*.
5. Feedback happens in **card comments**, quick questions in **Slack**.

You'll meet us properly on the kickoff call — but you don't have to wait for it. Add your first request now and we'll get moving.`;

async function trello(
  method: "GET" | "POST" | "PUT",
  path: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const key = Deno.env.get("TRELLO_KEY");
  const token = Deno.env.get("TRELLO_TOKEN");
  if (!key || !token) throw new Error("TRELLO_KEY / TRELLO_TOKEN not set");

  const qs = new URLSearchParams({ ...params, key, token });
  const res = await fetch(`https://api.trello.com/1${path}?${qs}`, { method });
  if (!res.ok) {
    throw new Error(`Trello ${method} ${path} → ${res.status}: ${await res.text()}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

/**
 * Creates the client's private request board (with workflow lists + a welcome
 * card) and invites the client by email — Trello sends the invite email itself.
 */
async function provisionTrello(
  clientLabel: string,
  email: string,
): Promise<{ boardId: string; boardUrl: string }> {
  const workspace = Deno.env.get("TRELLO_WORKSPACE_ID");
  const board = await trello("POST", "/boards/", {
    name: `${clientLabel} · 13 Design`,
    defaultLists: "false",
    prefs_permissionLevel: workspace ? "org" : "private",
    desc: "Design requests for your 13 Design Studio subscription. Add a card per request; we start from the top.",
    ...(workspace ? { idOrganization: workspace } : {}),
  });
  const boardId = String(board.id);
  const boardUrl = String(board.url ?? board.shortUrl ?? "");

  let requestListId = "";
  for (let i = 0; i < TRELLO_LISTS.length; i++) {
    const list = await trello("POST", "/lists", {
      idBoard: boardId,
      name: TRELLO_LISTS[i],
      pos: String((i + 1) * 1024),
    });
    if (i === 0) requestListId = String(list.id);
  }

  if (requestListId) {
    await trello("POST", "/cards", {
      idList: requestListId,
      name: WELCOME_CARD_TITLE,
      desc: WELCOME_CARD_DESC,
    });
  }

  // Invites by email: Trello emails the client a join link for this board.
  await trello("PUT", `/boards/${boardId}/members`, { email, type: "normal" });

  return { boardId, boardUrl };
}

// ---------------------------------------------------------------------------
// Client welcome email
// ---------------------------------------------------------------------------

function welcomeHtml(opts: {
  firstName: string;
  tierLabel: string;
  boardUrl: string | null;
  slackUrl: string | null;
}): string {
  const step = (n: number, title: string, body: string) =>
    `<tr><td style="padding:10px 14px 10px 0;vertical-align:top;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#e8744c;">0${n}</td>
     <td style="padding:10px 0;"><div style="font-size:15px;font-weight:600;color:#111827;">${title}</div>
     <div style="font-size:14px;color:#4b5563;margin-top:3px;line-height:1.55;">${body}</div></td></tr>`;

  const steps = [
    step(
      1,
      "Join your request board",
      opts.boardUrl
        ? `We've set up a private Trello board just for you — it's where design requests live. A Trello invite is in your inbox, or go straight to <a href="${opts.boardUrl}" style="color:#c95c36;">your board</a>.`
        : "We're setting up your private Trello request board now — the invite lands in your inbox shortly.",
    ),
    ...(opts.slackUrl
      ? [
          step(
            2,
            "Join us on Slack",
            `Quick questions, day-to-day chat, and a direct line to the person doing the work: <a href="${opts.slackUrl}" style="color:#c95c36;">join our Slack</a>.`,
          ),
        ]
      : []),
    step(
      opts.slackUrl ? 3 : 2,
      "File your first request",
      "Add a card to <em>📥 Design requests</em> with the goal and any links or assets. We always start from the top of the list — no waiting for the kickoff call.",
    ),
    step(
      opts.slackUrl ? 4 : 3,
      "Kickoff call",
      "Within one business day we'll email you personally to introduce ourselves and book a kickoff call.",
    ),
  ].join("");

  return `<!doctype html><html><body style="margin:0;background:#f6f6f7;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="padding:22px 24px;border-bottom:1px solid #eee;">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;">13 Design Studio</div>
        <div style="font-size:20px;font-weight:600;color:#111827;margin-top:4px;">Welcome${opts.firstName ? `, ${opts.firstName}` : ""} — you're in.</div>
        <div style="font-size:13px;color:#6b7280;margin-top:4px;">${opts.tierLabel}</div>
      </div>
      <div style="padding:18px 24px;">
        <table style="border-collapse:collapse;width:100%;">${steps}</table>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:14px 0 0;">
          Paddle has emailed your receipt and invoice separately. Manage or cancel your
          subscription anytime from the link on your confirmation page or in any receipt.
          Questions? Just reply to this email.
        </p>
      </div>
    </div></body></html>`;
}

// ---------------------------------------------------------------------------
// One-time onboarding
// ---------------------------------------------------------------------------

async function onboard(opts: {
  email: string;
  name: string;
  tier: string;
}): Promise<{ boardId: string | null; boardUrl: string | null; failures: string[] }> {
  const failures: string[] = [];
  let boardId: string | null = null;
  let boardUrl: string | null = null;

  const clientLabel = opts.name || opts.email.split("@")[0];

  try {
    const board = await provisionTrello(clientLabel, opts.email);
    boardId = board.boardId;
    boardUrl = board.boardUrl;
  } catch (err) {
    console.error("Trello provisioning failed:", err);
    failures.push(`Trello board/invite: ${err}`);
  }

  const slackUrl = Deno.env.get("SLACK_INVITE_URL") ?? null;
  const tierLabel = TIER_LABELS[opts.tier] ?? (opts.tier || "Subscription");

  const sent = await sendEmail({
    to: opts.email,
    subject: "Welcome to 13 Design Studio — your workspace is ready",
    html: welcomeHtml({
      firstName: opts.name.split(" ")[0] ?? "",
      tierLabel,
      boardUrl,
      slackUrl,
    }),
    replyTo: STUDIO_EMAIL,
  });
  if (!sent) failures.push("Welcome email did not send (Resend)");

  await slackNotify(
    `:tada: *New subscriber* — ${opts.name || opts.email} on *${tierLabel}*` +
      (boardUrl ? `\nTrello board: ${boardUrl}` : "\n:warning: Trello board creation FAILED — set it up manually.") +
      (failures.length ? `\n:warning: Onboarding issues: ${failures.join("; ")}` : ""),
  );

  return { boardId, boardUrl, failures };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("Missing PADDLE_WEBHOOK_SECRET");
    return new Response("Server not configured", { status: 500 });
  }

  const signature = req.headers.get("paddle-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  if (!(await verifyPaddleSignature(raw, signature, webhookSecret))) {
    console.error("Signature verification failed");
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { event_type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.event_type) {
      case "subscription.created":
      case "subscription.activated": {
        const sub = event.data as unknown as SubPayload;
        const tier = tierOf(sub);

        // The subscription payload has no email — fetch the customer.
        const customer = await paddleGet<PaddleCustomer>(`/customers/${sub.customer_id}`);
        const email = customer?.email ?? "";
        const name = customer?.name ?? "";

        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id, onboarded_at")
          .eq("paddle_subscription_id", sub.id)
          .maybeSingle();

        await supabase.from("subscriptions").upsert(
          {
            paddle_subscription_id: sub.id,
            paddle_customer_id: sub.customer_id,
            email,
            name,
            tier,
            status: sub.status,
            amount_total: amountOf(sub),
            currency: sub.currency_code ?? null,
            current_period_end: sub.current_billing_period?.ends_at ?? null,
            cancel_at_period_end: cancelScheduled(sub),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "paddle_subscription_id" },
        );

        // Onboard exactly once, on activation, when we have an email to invite.
        const shouldOnboard =
          event.event_type === "subscription.activated" && !existing?.onboarded_at && !!email;
        if (!shouldOnboard) break;

        const { boardId, boardUrl, failures } = await onboard({ email, name, tier });

        // Marked onboarded even on partial failure: the studio gets the
        // failure list below, and a webhook retry must not create a second
        // board or re-email the client.
        await supabase
          .from("subscriptions")
          .update({
            onboarded_at: new Date().toISOString(),
            trello_board_id: boardId,
            trello_board_url: boardUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("paddle_subscription_id", sub.id);

        await emailStudio(
          failures.length ? "New subscription — onboarding needs attention" : "New subscription",
          [
            ["Plan", TIER_LABELS[tier] ?? (tier || "—")],
            ["Name", name || "—"],
            ["Email", email || "—"],
            ["Amount", money(amountOf(sub), sub.currency_code)],
            ["Status", sub.status],
            ["Trello board", boardUrl ? `<a href="${boardUrl}">${boardUrl}</a>` : "❌ not created"],
            ["Subscription", sub.id],
            ...(failures.length
              ? ([["Follow up", failures.join("<br/>")]] as [string, string][])
              : []),
          ],
        );
        break;
      }

      case "subscription.updated":
      case "subscription.canceled": {
        const sub = event.data as unknown as SubPayload;
        const ended = event.event_type === "subscription.canceled";

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: sub.current_billing_period?.ends_at ?? null,
            cancel_at_period_end: cancelScheduled(sub),
            updated_at: new Date().toISOString(),
          })
          .eq("paddle_subscription_id", sub.id);

        // Only tell the studio about things worth knowing about.
        const notable =
          ended || cancelScheduled(sub) || ["past_due", "paused"].includes(sub.status);
        if (!notable) break;

        const { data } = await supabase
          .from("subscriptions")
          .select("email, tier")
          .eq("paddle_subscription_id", sub.id)
          .maybeSingle();

        const subject = ended
          ? "Subscription ended"
          : `Subscription ${cancelScheduled(sub) ? "set to cancel" : sub.status}`;

        await emailStudio(subject, [
          ["Plan", TIER_LABELS[data?.tier ?? ""] ?? data?.tier ?? "—"],
          ["Email", data?.email ?? "—"],
          ["Status", sub.status],
          ["Cancels at period end", cancelScheduled(sub) ? "Yes" : "No"],
          [
            "Period ends",
            sub.current_billing_period?.ends_at
              ? new Date(sub.current_billing_period.ends_at).toUTCString()
              : "—",
          ],
          ["Subscription", sub.id],
        ]);
        await slackNotify(
          `:small_red_triangle_down: *${subject}* — ${data?.email ?? sub.id} (${
            TIER_LABELS[data?.tier ?? ""] ?? data?.tier ?? "?"
          })`,
        );
        break;
      }

      case "transaction.completed": {
        // Ties the transaction back to the row: the actual charged total and
        // the txn id (used by support and the billing-portal lookup).
        const txn = event.data as unknown as {
          id: string;
          subscription_id?: string | null;
          currency_code?: string;
          details?: { totals?: { grand_total?: string } };
        };
        if (!txn.subscription_id) break;

        const grand = txn.details?.totals?.grand_total;
        const amount = grand == null ? NaN : parseInt(grand, 10);

        await supabase
          .from("subscriptions")
          .update({
            paddle_transaction_id: txn.id,
            ...(Number.isFinite(amount)
              ? { amount_total: amount, currency: txn.currency_code ?? null }
              : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("paddle_subscription_id", txn.subscription_id);
        break;
      }

      case "transaction.payment_failed": {
        // Paddle's own dunning (Retain) emails the customer and retries; this
        // makes sure the studio finds out too, rather than noticing the money
        // never arrived.
        const txn = event.data as unknown as {
          id: string;
          subscription_id?: string | null;
          customer_id?: string;
          currency_code?: string;
          details?: { totals?: { grand_total?: string } };
        };
        if (!txn.subscription_id) break;

        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("paddle_subscription_id", txn.subscription_id);

        const { data } = await supabase
          .from("subscriptions")
          .select("email, tier")
          .eq("paddle_subscription_id", txn.subscription_id)
          .maybeSingle();

        const grand = txn.details?.totals?.grand_total;
        const amount = grand == null ? null : parseInt(grand, 10);

        await emailStudio("Subscription payment failed", [
          ["Plan", TIER_LABELS[data?.tier ?? ""] ?? data?.tier ?? "—"],
          ["Email", data?.email ?? "—"],
          ["Amount due", money(Number.isFinite(amount as number) ? amount : null, txn.currency_code)],
          ["Transaction", txn.id],
          ["Subscription", txn.subscription_id],
        ]);
        await slackNotify(
          `:rotating_light: *Payment failed* — ${data?.email ?? txn.subscription_id} (${
            TIER_LABELS[data?.tier ?? ""] ?? data?.tier ?? "?"
          })`,
        );
        break;
      }

      default:
        // Unhandled event types are acknowledged so Paddle stops retrying.
        break;
    }
  } catch (err) {
    console.error("Handler error:", event.event_type, err);
    // 500 tells Paddle to retry.
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
