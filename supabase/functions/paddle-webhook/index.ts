// Supabase Edge Function: paddle-webhook
//
// Receives Paddle Billing events, verifies the signature, records the
// subscription in the `subscriptions` table (service role), and runs the
// one-time client onboarding:
//   - a private Trello request board (4 workflow lists + start-here card),
//     with the client invited by email and the design team added,
//   - a private per-client Slack channel (#<client>-design) with the design
//     team invited, the client added (or sent the standing invite link), and a
//     welcome message posted,
//   - a Trello webhook registered on the board so card activity syncs to Slack,
//   - a welcome email to the client (Trello + Slack links) and a studio alert.
//
// Handled events:
//   subscription.activated       — first payment done → upsert row + onboard once
//   subscription.created         — defensive upsert (activated normally follows)
//   subscription.updated         — status / renewal / scheduled-cancel change
//   subscription.canceled        — subscription ended
//   transaction.completed        — records txn id + actual amount on the row
//   transaction.payment_failed   — renewal failed → alert the studio
//
// Onboarding is idempotent via subscriptions.onboarded_at: Paddle retries
// webhooks, and provisioning + emails must run exactly once. If a step fails we
// still mark the subscription onboarded and email the studio the failures for
// manual follow-up — a retry storm creating five boards is worse than one
// missed invite the studio hears about immediately.
//
// Required secrets: see LAUNCH.md Step 8. Beyond the Paddle/Trello/Resend set,
// the expanded onboarding uses SLACK_BOT_TOKEN, DESIGN_TEAM_TRELLO_MEMBER_IDS,
// DESIGN_TEAM_SLACK_USER_IDS, and TRELLO_WEBHOOK_CALLBACK_URL.
//
// Deploy: supabase functions deploy paddle-webhook --no-verify-jwt --use-api

import { serviceClient } from "../_shared/db.ts";
import {
  channelNameFor,
  designTeamSlackIds,
  designTeamTrelloIds,
  STUDIO_EMAIL,
  TIER_LABELS,
  tierLabel,
} from "../_shared/config.ts";
import {
  addBoardMember,
  createBoardWebhook,
  inviteMemberByEmail,
  provisionBoard,
} from "../_shared/trello.ts";
import {
  createChannel,
  inviteClient,
  inviteLink,
  inviteUsers,
  notifyStudio,
  postMessage,
} from "../_shared/slack.ts";
import { emailStudio, money, sendEmail, welcomeHtml } from "../_shared/email.ts";
import { channelWelcomeBlocks } from "../_shared/messages.ts";

function paddleBase(): string {
  return Deno.env.get("PADDLE_ENV") === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

/** URL Trello should call for this project's board activity. */
function trelloCallbackUrl(): string | null {
  const explicit = Deno.env.get("TRELLO_WEBHOOK_CALLBACK_URL");
  if (explicit) return explicit;
  const base = Deno.env.get("SUPABASE_URL");
  return base ? `${base}/functions/v1/trello-webhook` : null;
}

// ---------------------------------------------------------------------------
// Paddle signature verification
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

// ---------------------------------------------------------------------------
// Slack welcome message posted into the new client channel
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// One-time onboarding
// ---------------------------------------------------------------------------

type OnboardResult = {
  boardId: string | null;
  boardUrl: string | null;
  slackChannelId: string | null;
  slackChannelName: string | null;
  failures: string[];
};

async function onboard(opts: {
  email: string;
  name: string;
  tier: string;
}): Promise<OnboardResult> {
  const failures: string[] = [];
  const clientLabel = opts.name || opts.email.split("@")[0];
  const firstName = opts.name.split(" ")[0] ?? "";

  let boardId: string | null = null;
  let boardUrl: string | null = null;

  // --- Trello: board + client invite + team + activity webhook ---
  try {
    const board = await provisionBoard(clientLabel);
    boardId = board.boardId;
    boardUrl = board.boardUrl;

    try {
      await inviteMemberByEmail(boardId, opts.email);
    } catch (err) {
      failures.push(`Trello client invite: ${err}`);
    }

    for (const memberId of designTeamTrelloIds()) {
      try {
        await addBoardMember(boardId, memberId);
      } catch (err) {
        failures.push(`Trello team add (${memberId}): ${err}`);
      }
    }

    const callback = trelloCallbackUrl();
    if (callback) {
      try {
        await createBoardWebhook(boardId, callback);
      } catch (err) {
        failures.push(`Trello board webhook: ${err}`);
      }
    } else {
      failures.push("Trello board webhook skipped: no callback URL configured");
    }
  } catch (err) {
    console.error("Trello provisioning failed:", err);
    failures.push(`Trello board: ${err}`);
  }

  // --- Slack: dedicated channel + team + client + welcome message ---
  let slackChannelId: string | null = null;
  let slackChannelName: string | null = null;
  try {
    const channel = await createChannel(channelNameFor(clientLabel));
    if (channel) {
      slackChannelId = channel.id;
      slackChannelName = channel.name;

      await inviteUsers(channel.id, designTeamSlackIds());

      const invited = await inviteClient(channel.id, opts.email);
      if (!invited.added) {
        failures.push(
          `Slack client invite (${invited.error ?? "unavailable"}) — sent standing invite link instead`,
        );
      }

      await postMessage(
        channel.id,
        `Welcome to 13 Design Studio${firstName ? `, ${firstName}` : ""}!`,
        channelWelcomeBlocks(firstName, boardUrl),
      );
    } else {
      failures.push("Slack channel not created (check SLACK_BOT_TOKEN + scopes)");
    }
  } catch (err) {
    console.error("Slack provisioning failed:", err);
    failures.push(`Slack channel: ${err}`);
  }

  // --- Client welcome email ---
  const slackUrl = inviteLink();
  const sent = await sendEmail({
    to: opts.email,
    subject: "Welcome to 13 Design Studio — your workspace is ready",
    html: welcomeHtml({
      firstName,
      tierLabel: tierLabel(opts.tier),
      boardUrl,
      slackUrl,
    }),
    replyTo: STUDIO_EMAIL,
  });
  if (!sent) failures.push("Welcome email did not send (Resend)");

  return { boardId, boardUrl, slackChannelId, slackChannelName, failures };
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

  const supabase = serviceClient();

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

        const { boardId, boardUrl, slackChannelId, slackChannelName, failures } = await onboard({
          email,
          name,
          tier,
        });

        // Marked onboarded even on partial failure: the studio gets the failure
        // list below, and a webhook retry must not create a second board/channel
        // or re-email the client.
        await supabase
          .from("subscriptions")
          .update({
            onboarded_at: new Date().toISOString(),
            trello_board_id: boardId,
            trello_board_url: boardUrl,
            slack_channel_id: slackChannelId,
            slack_channel_name: slackChannelName,
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
            ["Slack channel", slackChannelName ? `#${slackChannelName}` : "❌ not created"],
            ["Subscription", sub.id],
            ...(failures.length
              ? ([["Follow up", failures.join("<br/>")]] as [string, string][])
              : []),
          ],
        );

        await notifyStudio(
          `:tada: *New subscriber* — ${name || email} on *${tierLabel(tier)}*` +
            (boardUrl ? `\nTrello: ${boardUrl}` : "\n:warning: Trello board FAILED") +
            (slackChannelName ? `\nChannel: #${slackChannelName}` : "\n:warning: Slack channel FAILED") +
            (failures.length ? `\n:warning: Issues: ${failures.join("; ")}` : ""),
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
          ["Plan", tierLabel(data?.tier)],
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
        await notifyStudio(
          `:small_red_triangle_down: *${subject}* — ${data?.email ?? sub.id} (${tierLabel(data?.tier)})`,
        );
        break;
      }

      case "transaction.completed": {
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
          ["Plan", tierLabel(data?.tier)],
          ["Email", data?.email ?? "—"],
          ["Amount due", money(Number.isFinite(amount as number) ? amount : null, txn.currency_code)],
          ["Transaction", txn.id],
          ["Subscription", txn.subscription_id],
        ]);
        await notifyStudio(
          `:rotating_light: *Payment failed* — ${data?.email ?? txn.subscription_id} (${tierLabel(data?.tier)})`,
        );
        break;
      }

      default:
        // Unhandled event types are acknowledged so Paddle stops retrying.
        break;
    }
  } catch (err) {
    console.error("Handler error:", event.event_type, err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
