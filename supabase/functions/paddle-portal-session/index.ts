// Supabase Edge Function: paddle-portal-session
//
// Opens Paddle's hosted customer portal so a subscriber can update their card,
// download invoices, or cancel — without emailing the studio. The pricing page
// promises "month-to-month · cancel anytime", so this is what makes that true.
//
// The site has no auth, so access is proven by possession of the transaction
// id (txn_…), which is only ever handed to the person who completed that
// checkout (the success page receives it from the overlay's completed event).
// We look up the transaction's customer server-side and mint a portal session
// for them.
//
// Required secrets: PADDLE_API_KEY, PADDLE_ENV ('sandbox' | 'production')
// Deploy: supabase functions deploy paddle-portal-session --no-verify-jwt

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

function paddleBase(): string {
  return Deno.env.get("PADDLE_ENV") === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const apiKey = Deno.env.get("PADDLE_API_KEY");
  if (!apiKey) return json({ error: "server_not_configured" }, 500);

  let transactionId: string;
  try {
    ({ transaction_id: transactionId } = await req.json());
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (typeof transactionId !== "string" || !transactionId.startsWith("txn_")) {
    return json({ error: "missing_transaction_id" }, 400);
  }

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  try {
    const txnRes = await fetch(`${paddleBase()}/transactions/${transactionId}`, { headers });
    if (!txnRes.ok) {
      console.error("Transaction lookup failed:", txnRes.status, await txnRes.text());
      return json({ error: "transaction_not_found" }, 404);
    }
    const txn = (await txnRes.json()).data as {
      customer_id?: string | null;
      subscription_id?: string | null;
    };
    if (!txn.customer_id) return json({ error: "no_customer_on_transaction" }, 400);

    // Scoping the session to the subscription puts its cancel/update flows on
    // the portal's front page rather than one click deeper.
    const portalRes = await fetch(
      `${paddleBase()}/customers/${txn.customer_id}/portal-sessions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(
          txn.subscription_id ? { subscription_ids: [txn.subscription_id] } : {},
        ),
      },
    );
    if (!portalRes.ok) {
      console.error("Portal session failed:", portalRes.status, await portalRes.text());
      return json({ error: "portal_error" }, 502);
    }
    const portal = (await portalRes.json()).data as {
      urls?: { general?: { overview?: string } };
    };

    const url = portal.urls?.general?.overview;
    if (!url) return json({ error: "no_portal_url" }, 502);
    return json({ url });
  } catch (err) {
    console.error("Portal session error:", err);
    return json({ error: "paddle_error", detail: String(err) }, 502);
  }
});
