// Resend email + the studio's HTML templates. Shared by paddle-webhook (welcome
// + studio alerts) and available to the other functions for failure notices.

import { STUDIO_EMAIL } from "./config.ts";

export function money(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null) return "—";
  return `${(amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  })}`;
}

/** Sends one email via Resend. Returns false (never throws) when unconfigured. */
export async function sendEmail(opts: {
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

export function studioCard(subject: string, rows: [string, string][]): string {
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

export async function emailStudio(subject: string, rows: [string, string][]): Promise<void> {
  const to = Deno.env.get("NOTIFY_TO");
  if (!to) {
    console.error("NOTIFY_TO missing; skipping studio email");
    return;
  }
  await sendEmail({ to, subject, html: studioCard(subject, rows) });
}

/** The client welcome email sent once on activation, with Trello + Slack links. */
export function welcomeHtml(opts: {
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
            "Join your Slack channel",
            `We've opened a private channel just for your project — quick questions, day-to-day chat, and a direct line to the person doing the work: <a href="${opts.slackUrl}" style="color:#c95c36;">join the channel</a>. You can also file a request there with <code>/design-request</code>.`,
          ),
        ]
      : []),
    step(
      opts.slackUrl ? 3 : 2,
      "File your first request",
      "Add a card to <em>📥 Design requests</em> with the goal and any links or assets — or type <code>/design-request</code> in Slack. We always start from the top of the list, no waiting for the kickoff call.",
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

export { STUDIO_EMAIL };
