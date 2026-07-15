// Supabase Edge Function: create-portal-session
//
// Opens Stripe's hosted Customer Portal so a subscriber can update their card,
// download invoices, or cancel — without emailing the studio. The pricing page
// promises "month-to-month · cancel anytime", so this is what makes that true.
//
// The site has no auth, so access is proven by possession of the Checkout
// session id, which is only ever handed to the person who completed that
// checkout (it lands in their success_url). This is Stripe's documented
// pattern for post-checkout portal access.
//
// Returning customers who no longer have that link should use the portal's
// own email-login page (Dashboard → Settings → Billing → Customer portal),
// where Stripe emails them a secure link.
//
// Required secrets: STRIPE_SECRET_KEY, SITE_URL
// Deploy: supabase functions deploy create-portal-session --no-verify-jwt

import Stripe from "npm:stripe@17.5.0";

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
  if (!secretKey || !siteUrl) return json({ error: "server_not_configured" }, 500);

  let sessionId: string;
  try {
    ({ session_id: sessionId } = await req.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (!sessionId || typeof sessionId !== "string") {
    return json({ error: "missing_session_id" }, 400);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2024-12-18.acacia" });

  try {
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const customer = checkout.customer;
    if (!customer) return json({ error: "no_customer_on_session" }, 400);

    const portal = await stripe.billingPortal.sessions.create({
      customer: String(customer),
      return_url: `${siteUrl}/subscribe/success?session_id=${sessionId}`,
    });

    return json({ url: portal.url });
  } catch (err) {
    console.error("Portal session error:", err);
    return json({ error: "stripe_error", detail: String(err) }, 502);
  }
});
