// Supabase Edge Function: stripe-webhook
//
// Receives Stripe events, verifies the signature, records the subscription in
// the `subscriptions` table (service role), and emails the studio via Resend.
//
// Handled events:
//   checkout.session.completed          — a new subscription was paid for
//   customer.subscription.updated       — status / renewal / cancellation change
//   customer.subscription.deleted       — subscription ended
//
// Required secrets:
//   STRIPE_SECRET_KEY          — sk_test_… / sk_live_…
//   STRIPE_WEBHOOK_SECRET      — whsec_… from the Stripe webhook endpoint
//   SUPABASE_URL               — provided automatically by the platform
//   SUPABASE_SERVICE_ROLE_KEY  — provided automatically by the platform
//   RESEND_API_KEY / NOTIFY_TO / NOTIFY_FROM — reused from notify-inquiry
//
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripe signs the request; it does not send a Supabase JWT.)

import Stripe from "npm:stripe@17.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const TIER_LABELS: Record<string, string> = {
  lite: "Lite — $800/mo",
  standard: "Standard — $2,500/mo",
};

/**
 * Current period end, as an ISO string, or null.
 *
 * Stripe moved `current_period_end` off the subscription and onto its items in
 * newer API versions. Webhook payloads arrive in the account's default version,
 * which may differ from the version this function pins — so read both shapes
 * rather than assuming either. Getting this wrong throws on `new Date(NaN)`.
 */
function periodEndIso(sub: Stripe.Subscription): string | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = (sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)
    ?.current_period_end;
  const secs = typeof top === "number" ? top : typeof item === "number" ? item : null;
  return secs === null ? null : new Date(secs * 1000).toISOString();
}

/**
 * The subscription id an invoice belongs to, or null for one-off invoices.
 *
 * Same trap as periodEndIso: newer API versions moved `subscription` off the
 * invoice and onto `parent.subscription_details.subscription`. Reading only the
 * legacy field makes this handler silently no-op on a real failed renewal —
 * no error, no retry, no alert. Read both shapes.
 */
function subscriptionIdOfInvoice(inv: Stripe.Invoice): string | null {
  const idOf = (v: unknown): string | null => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object" && typeof (v as { id?: string }).id === "string") {
      return (v as { id: string }).id;
    }
    return null;
  };

  const legacy = idOf((inv as unknown as { subscription?: unknown }).subscription);
  if (legacy) return legacy;

  const nested = (inv as unknown as {
    parent?: { subscription_details?: { subscription?: unknown } };
  }).parent?.subscription_details?.subscription;
  return idOf(nested);
}

function money(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  return `${(amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
  })}`;
}

async function emailStudio(subject: string, rows: [string, string][]) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_TO");
  const from = Deno.env.get("NOTIFY_FROM");
  if (!apiKey || !to || !from) {
    console.error("Resend env missing; skipping studio email");
    return;
  }

  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;color:#111827;font-size:14px;">${v}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f6f6f7;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="padding:20px 24px;border-bottom:1px solid #eee;">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;">13 Design Studio</div>
        <div style="font-size:18px;font-weight:600;color:#111827;margin-top:4px;">${subject}</div>
      </div>
      <div style="padding:20px 24px;"><table style="border-collapse:collapse;width:100%;">${body}</table></div>
    </div></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) console.error("Resend error:", res.status, await res.text());
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secretKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    // Async variant is required on Deno (Web Crypto).
    event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (!s.subscription) break;

        const sub = await stripe.subscriptions.retrieve(String(s.subscription));
        const tier = s.metadata?.tier ?? sub.metadata?.tier ?? "";
        const email = s.customer_details?.email ?? s.customer_email ?? "";
        const name = s.customer_details?.name ?? "";

        await supabase.from("subscriptions").upsert(
          {
            stripe_customer_id: String(s.customer ?? ""),
            stripe_subscription_id: sub.id,
            stripe_checkout_session_id: s.id,
            email,
            name,
            tier,
            status: sub.status,
            amount_total: s.amount_total,
            currency: s.currency,
            current_period_end: periodEndIso(sub),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" },
        );

        await emailStudio("New subscription", [
          ["Plan", TIER_LABELS[tier] ?? (tier || "—")],
          ["Name", name || "—"],
          ["Email", email || "—"],
          ["Amount", money(s.amount_total, s.currency)],
          ["Status", sub.status],
          ["Subscription", sub.id],
        ]);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: periodEndIso(sub),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        // Only tell the studio about things worth knowing about.
        const notable =
          event.type === "customer.subscription.deleted" ||
          sub.cancel_at_period_end ||
          ["past_due", "unpaid", "canceled"].includes(sub.status);

        if (notable) {
          const { data } = await supabase
            .from("subscriptions")
            .select("email, tier")
            .eq("stripe_subscription_id", sub.id)
            .maybeSingle();

          await emailStudio(
            event.type === "customer.subscription.deleted"
              ? "Subscription ended"
              : `Subscription ${sub.cancel_at_period_end ? "set to cancel" : sub.status}`,
            [
              ["Plan", TIER_LABELS[data?.tier ?? ""] ?? data?.tier ?? "—"],
              ["Email", data?.email ?? "—"],
              ["Status", sub.status],
              ["Cancels at period end", sub.cancel_at_period_end ? "Yes" : "No"],
              ["Period ends", periodEndIso(sub) ? new Date(periodEndIso(sub)!).toUTCString() : "—"],
              ["Subscription", sub.id],
            ],
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const subId = subscriptionIdOfInvoice(inv);
        if (!subId) break;

        // Stripe's Smart Retries handle dunning and email the customer; this
        // just makes sure the studio finds out too, rather than noticing the
        // money never arrived.
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);

        const { data } = await supabase
          .from("subscriptions")
          .select("email, tier")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        // If the very first payment failed there is no checkout.session.completed
        // and therefore no row yet — fall back to the invoice's own data so the
        // alert is still actionable.
        const invoiceTier = (inv as unknown as {
          parent?: { subscription_details?: { metadata?: { tier?: string } } };
        }).parent?.subscription_details?.metadata?.tier;
        const tier = data?.tier || invoiceTier || "";

        await emailStudio("Subscription payment failed", [
          ["Plan", TIER_LABELS[tier] ?? (tier || "—")],
          ["Email", data?.email || inv.customer_email || "—"],
          ["Customer", inv.customer_name || "—"],
          ["Amount due", money(inv.amount_due, inv.currency)],
          ["Attempt", String(inv.attempt_count ?? 1)],
          ["Next retry", inv.next_payment_attempt ? new Date(inv.next_payment_attempt * 1000).toUTCString() : "no further retries"],
          ["Invoice", inv.hosted_invoice_url ? `<a href="${inv.hosted_invoice_url}">View invoice</a>` : inv.id],
        ]);
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("Handler error:", event.type, err);
    // 500 tells Stripe to retry.
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
