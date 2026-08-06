// Supabase Edge Function: notify-inquiry
//
// Emails the studio whenever a new row is inserted into `contact_inquiries`
// or `founder_inquiries`. Wired up via a Supabase Database Webhook (one per
// table) that POSTs the inserted row to this function.
//
// Required secrets (set with `supabase secrets set ...`):
//   RESEND_API_KEY   — from resend.com → API Keys
//   NOTIFY_TO        — where alerts land, e.g. hello@13design.org
//   NOTIFY_FROM      — verified Resend sender, e.g. "13 Design <notify@13design.org>"
//   WEBHOOK_SECRET   — any long random string; must match the header the
//                      Database Webhook sends (see LAUNCH.md). Optional but
//                      recommended so only your webhook can trigger emails.
//
// Deploy: supabase functions deploy notify-inquiry --no-verify-jwt

interface WebhookPayload {
  type: string;
  table: string;
  record: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
  tier: "Subscribing to",
  name: "Name",
  email: "Email",
  company: "Company / product",
  product_name: "Company / product",
  product_url: "Product link",
  product_kind: "Product kind",
  stage: "Stage",
  looking_for: "Looking for",
  timeline: "Timeline",
  challenges: "Challenges",
  what_feels_off: "What feels off",
  whats_next: "What's next",
  message: "Message",
  anything_else: "Anything else",
  ok_to_share: "OK to share",
  country: "Country",
  billing_address: "Billing address",
  vat_id: "VAT / Tax ID",
  note: "Note",
};

const ORDER = Object.keys(LABELS);

// Internal / lifecycle columns never shown in the notification email.
const HIDDEN = new Set([
  "id",
  "created_at",
  "status",
  "zoho_customer_id",
  "zoho_invoice_id",
  "approved_at",
]);

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

/** Hex HMAC-SHA256 — must match subscribe-approve's token scheme. */
async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Post a plain message to the studio's Slack ops channel via the bot. */
async function slackPost(text: string): Promise<boolean> {
  const token = Deno.env.get("SLACK_BOT_TOKEN");
  const channel = Deno.env.get("STUDIO_SLACK_CHANNEL_ID");
  if (!token || !channel) {
    console.error("Slack notify: missing SLACK_BOT_TOKEN / STUDIO_SLACK_CHANNEL_ID");
    return false;
  }
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ channel, text, unfurl_links: false }),
  });
  const data = await res.json().catch(() => ({}));
  if (!(data as { ok?: boolean }).ok) console.error("Slack post failed:", JSON.stringify(data));
  return !!(data as { ok?: boolean }).ok;
}

function renderRows(record: Record<string, unknown>): string {
  const keys = Object.keys(record)
    .filter((k) => !HIDDEN.has(k) && record[k] != null && String(record[k]).trim() !== "")
    .sort((a, b) => {
      const ia = ORDER.indexOf(a);
      const ib = ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  return keys
    .map((k) => {
      const label = esc(LABELS[k] ?? k);
      const value = esc(String(record[k]));
      return `<tr>
        <td style="padding:6px 14px 6px 0;color:#6b7280;font-size:13px;vertical-align:top;white-space:nowrap;">${label}</td>
        <td style="padding:6px 0;color:#111827;font-size:14px;">${value.replace(/\n/g, "<br>")}</td>
      </tr>`;
    })
    .join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Optional shared-secret check.
  const expected = Deno.env.get("WEBHOOK_SECRET");
  if (expected) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== expected) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const record = payload.record ?? {};
  const isFounder = payload.table === "founder_inquiries";
  const isSubscribe = payload.table === "subscribe_requests";
  const kind = isSubscribe
    ? "Subscription request"
    : isFounder
    ? "Founding-client application"
    : "Contact message";
  const who = String(record.name ?? "Someone");

  // Subscription requests notify the studio via Slack (with a signed one-click
  // "Review & approve" link), not email — nothing here depends on Resend.
  if (isSubscribe) {
    const base = Deno.env.get("SUPABASE_URL");
    const secret = Deno.env.get("APPROVE_SECRET");
    const rid = String(record.id ?? "");
    let link = "";
    if (base && secret && rid) {
      link = `${base}/functions/v1/subscribe-approve?id=${encodeURIComponent(rid)}&token=${await hmacHex(secret, rid)}`;
    } else {
      console.error("subscribe notify: missing SUPABASE_URL / APPROVE_SECRET / id");
    }
    const TIER_LABEL: Record<string, string> = {
      lite: "Lite — $800/mo",
      standard: "Standard — $2,500/mo",
      "product-partner": "Product Partner — $4,500/mo",
    };
    const val = (k: string) => {
      const v = record[k];
      return v == null || String(v).trim() === "" ? "" : String(v);
    };
    const lines = [
      `:inbox_tray: *New subscription request* — ${val("name") || "(no name)"}${val("email") ? ` <${val("email")}>` : ""}`,
      `*Plan:* ${TIER_LABEL[val("tier")] ?? (val("tier") || "—")}    *Company:* ${val("company") || "—"}    *Country:* ${val("country") || "—"}`,
      val("billing_address") ? `*Billing:* ${val("billing_address")}` : "",
      val("vat_id") ? `*VAT/Tax ID:* ${val("vat_id")}` : "",
      val("note") ? `*Note:* ${val("note")}` : "",
      link ? `<${link}|:white_check_mark: Review & approve →>` : ":warning: approve link unavailable (missing APPROVE_SECRET / SUPABASE_URL)",
    ].filter(Boolean);
    const posted = await slackPost(lines.join("\n"));
    return new Response(JSON.stringify({ ok: posted, via: "slack" }), {
      status: posted ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Contact / founder inquiries → studio email via Resend.
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_TO");
  const from = Deno.env.get("NOTIFY_FROM");
  if (!apiKey || !to || !from) {
    console.error("Missing RESEND_API_KEY / NOTIFY_TO / NOTIFY_FROM");
    return new Response("Server not configured", { status: 500 });
  }

  const subject = `New ${kind.toLowerCase()} — ${who}`;
  const replyTo = typeof record.email === "string" ? record.email : undefined;

  const html = `<!doctype html>
<html><body style="margin:0;background:#f6f6f7;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="padding:20px 24px;border-bottom:1px solid #eee;">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;">13 Design Studio</div>
      <div style="font-size:18px;font-weight:600;color:#111827;margin-top:4px;">${esc(kind)}</div>
    </div>
    <div style="padding:20px 24px;">
      <table style="border-collapse:collapse;width:100%;">${renderRows(record)}</table>
    </div>
    ${replyTo ? `<div style="padding:0 24px 22px;"><a href="mailto:${esc(replyTo)}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-size:14px;padding:10px 18px;border-radius:9999px;">Reply to ${esc(who)}</a></div>` : ""}
  </div>
</body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend error:", res.status, detail);
    return new Response(JSON.stringify({ error: "email_send_failed", resend_status: res.status, detail }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
