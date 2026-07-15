// Supabase Edge Function: create-checkout-session
//
// Called from the Subscription page when a visitor clicks "Subscribe" on a
// self-serve tier. Creates a Stripe Checkout session and returns its URL for
// the browser to redirect to.
//
// Only Lite and Standard are sold self-serve. Embedded is call-first and is
// rejected here as well as hidden in the UI — never trust the client to enforce
// which tiers are purchasable.
//
// Required secrets:
//   STRIPE_SECRET_KEY      — sk_test_… / sk_live_…
//   STRIPE_PRICE_LITE      — price_… for the $800/mo recurring price
//   STRIPE_PRICE_STANDARD  — price_… for the $2,500/mo recurring price
//   SITE_URL               — e.g. https://13studio.netlify.app (no trailing slash)
//
// Deploy: supabase functions deploy create-checkout-session

import Stripe from "npm:stripe@17.5.0";

const SELF_SERVE_TIERS = ["lite", "standard"] as const;
type SelfServeTier = (typeof SELF_SERVE_TIERS)[number];

const PRICE_ENV: Record<SelfServeTier, string> = {
  lite: "STRIPE_PRICE_LITE",
  standard: "STRIPE_PRICE_STANDARD",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "");
  if (!secretKey || !siteUrl) {
    console.error("Missing STRIPE_SECRET_KEY or SITE_URL");
    return json({ error: "server_not_configured" }, 500);
  }

  let tier: string;
  try {
    ({ tier } = await req.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  if (!SELF_SERVE_TIERS.includes(tier as SelfServeTier)) {
    // Embedded (or anything unknown) is not purchasable without a call.
    return json({ error: "tier_not_self_serve" }, 400);
  }

  const priceId = Deno.env.get(PRICE_ENV[tier as SelfServeTier]);
  if (!priceId) {
    console.error(`Missing ${PRICE_ENV[tier as SelfServeTier]}`);
    return json({ error: "price_not_configured" }, 500);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // In subscription mode Stripe always creates the Customer itself and
      // collects the email, so it can send the receipt and future invoices —
      // `customer_creation`/`customer_update` are payment-mode-only.
      // Billing address is required so Stripe Tax can pick the right rate.
      billing_address_collection: "required",
      automatic_tax: { enabled: true },
      // Let business customers supply a VAT / tax ID.
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: { tier },
      subscription_data: { metadata: { tier } },
      success_url: `${siteUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${siteUrl}/subscribe/cancel?tier=${tier}`,
    });

    if (!session.url) {
      console.error("Stripe returned a session without a URL");
      return json({ error: "no_session_url" }, 502);
    }

    return json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return json({ error: "stripe_error", detail: String(err) }, 502);
  }
});
