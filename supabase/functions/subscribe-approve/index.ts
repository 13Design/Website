// Supabase Edge Function: subscribe-approve
//
// The studio's one-click control panel for an invoice-based subscription request
// (from the /subscribe form → `subscribe_requests`). Reached via a signed link
// emailed to the studio.
//
//   GET  ?id=<uuid>&token=<hmac>     → renders a status-aware confirm page
//   POST (form: id, token, action)   → performs the action:
//     action=approve  → find/create the Zoho customer + a monthly recurring
//                       invoice (DRAFT — you send it from Zoho); status → approved
//     action=onboard  → run Trello + Slack + welcome-email onboarding and record a
//                       `subscriptions` row; status → active. Do this once paid.
//
// Auth: a per-request HMAC token = HMAC-SHA256(id, APPROVE_SECRET), hex. GET never
// mutates, so email link-scanners can't fire an action; only the POST does.
//
// Secrets: APPROVE_SECRET, the ZOHO_* set (see _shared/zoho.ts), plus the
// Trello/Slack/Resend onboarding set used by _shared/onboard.ts.
//
// Deploy: supabase functions deploy subscribe-approve --no-verify-jwt --use-api

import { serviceClient } from "../_shared/db.ts";
import { tierLabel } from "../_shared/config.ts";
import { emailStudio } from "../_shared/email.ts";
import { notifyStudio } from "../_shared/slack.ts";
import { onboard } from "../_shared/onboard.ts";
import {
  accessToken,
  createMonthlyRecurringInvoice,
  findOrCreateContact,
} from "../_shared/zoho.ts";

const TIERS: Record<string, { name: string; amount: number; days: string }> = {
  lite: { name: "Lite", amount: 800, days: "Up to 5 days / month" },
  standard: { name: "Standard", amount: 2500, days: "Up to 12 days / month" },
  "product-partner": { name: "Product Partner", amount: 4500, days: "Up to 20 days / month" },
};

type SubscribeRequest = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  billing_address: string | null;
  vat_id: string | null;
  tier: string;
  note: string | null;
  status: string;
  zoho_customer_id: string | null;
  zoho_invoice_id: string | null;
};

// --------------------------------------------------------------------------
// Signed-token auth
// --------------------------------------------------------------------------

async function sign(id: string): Promise<string> {
  const secret = Deno.env.get("APPROVE_SECRET");
  if (!secret) throw new Error("Missing APPROVE_SECRET");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --------------------------------------------------------------------------
// HTML rendering (minimal, self-contained)
// --------------------------------------------------------------------------

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function page(title: string, inner: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0b0b0d;color:#e9e6df;margin:0;padding:32px;}
  .card{max-width:560px;margin:32px auto;background:#141417;border:1px solid #2a2a30;border-radius:16px;padding:28px;}
  h1{font-size:20px;margin:0 0 4px;} .muted{color:#8a8a93;font-size:13px;}
  table{border-collapse:collapse;width:100%;margin:18px 0;} td{padding:6px 10px 6px 0;font-size:14px;vertical-align:top;}
  td.k{color:#8a8a93;white-space:nowrap;} .btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:600;
  padding:12px 22px;border-radius:9999px;text-decoration:none;} .primary{background:#e8744c;color:#0b0b0d;}
  .ghost{background:transparent;border:1px solid #3a3a42;color:#e9e6df;margin-left:8px;}
  .ok{color:#7bd88f;} .warn{color:#e8b04c;} form{display:inline;}
  a{color:#e8a; }
</style></head><body><div class="card">${inner}</div></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function detailRows(r: SubscribeRequest): string {
  const t = TIERS[r.tier];
  const rows: [string, string][] = [
    ["Plan", t ? `${t.name} — $${t.amount.toLocaleString()}/mo` : r.tier],
    ["Name", r.name],
    ["Email", r.email],
    ["Company", r.company || "—"],
    ["Country", r.country || "—"],
    ["Billing address", r.billing_address || "—"],
    ["VAT / Tax ID", r.vat_id || "—"],
    ["Note", r.note || "—"],
    ["Status", r.status],
  ];
  return rows.map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
}

function actionForm(id: string, token: string, action: string, label: string, cls: string): string {
  return `<form method="POST"><input type="hidden" name="id" value="${esc(id)}">
<input type="hidden" name="token" value="${esc(token)}">
<button class="btn ${cls}" type="submit" name="action" value="${esc(action)}">${esc(label)}</button></form>`;
}

// --------------------------------------------------------------------------
// Handler
// --------------------------------------------------------------------------

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let id: string;
  let token: string;
  let action = "";

  if (req.method === "GET") {
    id = url.searchParams.get("id") ?? "";
    token = url.searchParams.get("token") ?? "";
  } else if (req.method === "POST") {
    const form = await req.formData();
    id = String(form.get("id") ?? "");
    token = String(form.get("token") ?? "");
    action = String(form.get("action") ?? "");
  } else {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!id || !token) return page("Invalid link", `<h1>Invalid link</h1><p class="muted">Missing request id or token.</p>`);

  let expected: string;
  try {
    expected = await sign(id);
  } catch (err) {
    console.error(err);
    return new Response("Server not configured", { status: 500 });
  }
  if (!safeEqual(token, expected)) {
    return page("Unauthorized", `<h1>Unauthorized</h1><p class="muted">This link's token doesn't match.</p>`);
  }

  const supabase = serviceClient();
  const { data: reqRow, error } = await supabase
    .from("subscribe_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !reqRow) {
    return page("Not found", `<h1>Request not found</h1><p class="muted">It may have been removed.</p>`);
  }
  const r = reqRow as SubscribeRequest;
  const tier = TIERS[r.tier];

  // ---- GET: show the status-aware confirm page ----
  if (req.method === "GET") {
    let actions = "";
    if (r.status === "pending") {
      actions = actionForm(id, token, "approve", "Approve & create invoice", "primary") +
        `<p class="muted" style="margin-top:14px">Creates the Zoho customer and a monthly recurring invoice as a <b>draft</b> — you send it from Zoho. Do this once you've confirmed capacity and fit.</p>`;
    } else if (r.status === "approved") {
      actions = `<p class="ok">✓ Invoice created in Zoho${r.zoho_invoice_id ? ` (recurring #${esc(r.zoho_invoice_id)})` : ""}.</p>` +
        actionForm(id, token, "onboard", "Client paid — set up workspace", "primary") +
        `<p class="muted" style="margin-top:14px">Run once the first invoice is paid: creates the Trello board, Slack channel, and sends the welcome email.</p>`;
    } else if (r.status === "active") {
      actions = `<p class="ok">✓ Approved, invoiced, and onboarded. Nothing more to do here.</p>`;
    } else {
      actions = `<p class="warn">Status: ${esc(r.status)}</p>`;
    }
    return page(
      `Subscribe request — ${r.name}`,
      `<h1>Subscribe request</h1><p class="muted">Review and act on this request.</p>
       <table>${detailRows(r)}</table>${actions}`,
    );
  }

  // ---- POST: perform the action ----
  if (!tier) {
    return page("Unknown tier", `<h1>Unknown tier</h1><p class="muted">"${esc(r.tier)}" isn't a known plan.</p>`);
  }
  const clientLabel = r.name || r.email.split("@")[0];

  try {
    if (action === "approve") {
      if (r.status !== "pending") {
        return page("Already handled", `<h1>Already handled</h1><p class="muted">This request is "${esc(r.status)}", not pending.</p>`);
      }

      const token0 = await accessToken();
      const customerId = r.zoho_customer_id ??
        (await findOrCreateContact(token0, {
          name: r.name,
          email: r.email,
          company: r.company ?? undefined,
          country: r.country ?? undefined,
          address: r.billing_address ?? undefined,
          vatId: r.vat_id ?? undefined,
        }));

      const inv = await createMonthlyRecurringInvoice(token0, {
        customerId,
        tierName: tier.name,
        daysPerMonth: tier.days,
        amount: tier.amount,
        clientLabel,
      });

      await supabase
        .from("subscribe_requests")
        .update({
          status: "approved",
          zoho_customer_id: customerId,
          zoho_invoice_id: inv.recurringInvoiceId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      await emailStudio("Subscribe request approved — invoice ready to send", [
        ["Plan", `${tier.name} — $${tier.amount.toLocaleString()}/mo`],
        ["Client", `${r.name} <${r.email}>`],
        ["Zoho customer", customerId],
        ["Recurring invoice", inv.recurringInvoiceId],
        ["Next", "Review the draft in Zoho and send it. When it's paid, come back and set up the workspace."],
      ]);
      await notifyStudio(
        `:white_check_mark: *Approved* — ${r.name || r.email} on *${tier.name}*. Zoho recurring invoice created as a draft — review + send it, then onboard once paid.`,
      );

      return page(
        "Approved",
        `<h1 class="ok">✓ Approved</h1>
         <p>Zoho customer and a monthly recurring invoice (draft) were created for <b>${esc(r.name || r.email)}</b> on <b>${esc(tier.name)}</b>.</p>
         <p class="muted">Open Zoho Invoice, review the draft, and send it. Once it's paid, come back to this link and set up the workspace.</p>
         <div style="margin-top:18px">${actionForm(id, token, "onboard", "Client paid — set up workspace", "ghost")}</div>`,
      );
    }

    if (action === "onboard") {
      if (r.status === "active") {
        return page("Already onboarded", `<h1>Already onboarded</h1><p class="muted">This client's workspace is already set up.</p>`);
      }
      if (r.status !== "approved") {
        return page("Approve first", `<h1>Approve first</h1><p class="muted">Approve and invoice this request before onboarding.</p>`);
      }

      const result = await onboard({ email: r.email, name: r.name, tier: r.tier });

      // Record a subscriptions row so trello-webhook / slack-events can map the
      // board and channel back to this client.
      await supabase.from("subscriptions").insert({
        email: r.email,
        name: r.name,
        tier: r.tier,
        status: "active",
        onboarded_at: new Date().toISOString(),
        trello_board_id: result.boardId,
        trello_board_url: result.boardUrl,
        slack_channel_id: result.slackChannelId,
        slack_channel_name: result.slackChannelName,
      });

      await supabase.from("subscribe_requests").update({ status: "active" }).eq("id", id);

      await emailStudio(
        result.failures.length ? "Client onboarded — needs attention" : "Client onboarded",
        [
          ["Plan", tierLabel(r.tier)],
          ["Client", `${r.name} <${r.email}>`],
          ["Trello board", result.boardUrl ? `<a href="${result.boardUrl}">${result.boardUrl}</a>` : "❌ not created"],
          ["Slack channel", result.slackChannelName ? `#${result.slackChannelName}` : "❌ not created"],
          ...(result.failures.length ? ([["Follow up", result.failures.join("<br/>")]] as [string, string][]) : []),
        ],
      );
      await notifyStudio(
        `:tada: *Onboarded* — ${r.name || r.email} on *${tierLabel(r.tier)}*` +
          (result.boardUrl ? `\nTrello: ${result.boardUrl}` : "\n:warning: Trello board FAILED") +
          (result.slackChannelName ? `\nChannel: #${result.slackChannelName}` : "\n:warning: Slack channel FAILED") +
          (result.failures.length ? `\n:warning: Issues: ${result.failures.join("; ")}` : ""),
      );

      return page(
        "Onboarded",
        `<h1 class="ok">✓ Workspace set up</h1>
         <p><b>${esc(r.name || r.email)}</b> is onboarded on <b>${esc(tierLabel(r.tier))}</b>.</p>
         ${result.boardUrl ? `<p class="muted">Trello: <a href="${esc(result.boardUrl)}">${esc(result.boardUrl)}</a></p>` : `<p class="warn">Trello board was not created.</p>`}
         ${result.slackChannelName ? `<p class="muted">Slack: #${esc(result.slackChannelName)}</p>` : `<p class="warn">Slack channel was not created.</p>`}
         ${result.failures.length ? `<p class="warn">Some steps need follow-up — check your studio email.</p>` : ""}`,
      );
    }

    return page("Unknown action", `<h1>Unknown action</h1><p class="muted">"${esc(action)}" isn't a valid action.</p>`);
  } catch (err) {
    console.error("subscribe-approve action failed:", action, err);
    return page(
      "Something went wrong",
      `<h1 class="warn">Something went wrong</h1><p class="muted">${esc(String(err))}</p>
       <p class="muted">Nothing was changed for this request. You can safely try again.</p>`,
    );
  }
});
