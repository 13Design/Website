// Supabase Edge Function: notify-inquiry
//
// Emails the studio whenever a new row is inserted into `contact_inquiries`
// or `founder_inquiries`. Wired up via a Supabase Database Webhook (one per
// table) that POSTs the inserted row to this function.
//
// Required secrets (set with `supabase secrets set ...`):
//   RESEND_API_KEY   — from resend.com → API Keys
//   NOTIFY_TO        — where alerts land, e.g. hello@13design.studio
//   NOTIFY_FROM      — verified Resend sender, e.g. "13 Design <notify@13design.studio>"
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
};

const ORDER = Object.keys(LABELS);

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

function renderRows(record: Record<string, unknown>): string {
  const keys = Object.keys(record)
    .filter((k) => k !== "id" && k !== "created_at" && record[k] != null && String(record[k]).trim() !== "")
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

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_TO");
  const from = Deno.env.get("NOTIFY_FROM");
  if (!apiKey || !to || !from) {
    console.error("Missing RESEND_API_KEY / NOTIFY_TO / NOTIFY_FROM");
    return new Response("Server not configured", { status: 500 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const record = payload.record ?? {};
  const isFounder = payload.table === "founder_inquiries";
  const kind = isFounder ? "Founding-client application" : "Contact message";
  const who = String(record.name ?? "Someone");
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
