import {
  initializePaddle,
  CheckoutEventNames,
  type Paddle,
  type Environments,
} from '@paddle/paddle-js';
import { supabase } from './supabase';

/**
 * Paddle Billing checkout.
 *
 * Paddle is the merchant of record: it hosts the overlay checkout, computes and
 * remits VAT/sales tax, and emails the customer a receipt + invoice. The site
 * only needs a public client-side token and the price ids — no server call is
 * required to open checkout.
 *
 * Env (Vite exposes VITE_* to the browser; all of these are public by design):
 *   VITE_PADDLE_ENV            — 'sandbox' | 'production'
 *   VITE_PADDLE_CLIENT_TOKEN   — test_… / live_… client-side token
 *   VITE_PADDLE_PRICE_LITE     — pri_… for the $800/mo price
 *   VITE_PADDLE_PRICE_STANDARD — pri_… for the $2,500/mo price
 *
 * Only Lite and Standard have prices here: Product Partner is call-first, so
 * there is simply nothing to buy — the gating is structural, not cosmetic.
 */
const PRICE_IDS: Record<string, string | undefined> = {
  lite: import.meta.env.VITE_PADDLE_PRICE_LITE,
  standard: import.meta.env.VITE_PADDLE_PRICE_STANDARD,
};

const GENERIC_ERROR =
  "We couldn't open checkout. Please try again, or email hello@13design.org.";

/** Query params the success page receives once checkout completes. */
export type CheckoutResult = { tier: string; txn: string };

let paddlePromise: Promise<Paddle | undefined> | null = null;
// The completion handler for the currently open checkout. Module-level because
// Paddle takes one eventCallback at init time, not per Checkout.open().
let onCompleted: ((result: CheckoutResult) => void) | null = null;
let completedTier = '';

function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
    const environment = (import.meta.env.VITE_PADDLE_ENV ?? 'sandbox') as Environments;
    if (!token) return Promise.resolve(undefined);

    paddlePromise = initializePaddle({
      environment,
      token,
      checkout: {
        settings: { displayMode: 'overlay', theme: 'dark', locale: 'en' },
      },
      eventCallback: (event) => {
        if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return;
        const txn = event.data?.transaction_id ?? '';
        const handler = onCompleted;
        onCompleted = null;
        if (!handler) return;
        // Let Paddle's own "payment successful" state land before we take over.
        setTimeout(() => {
          getPaddle().then((p) => p?.Checkout.close());
          handler({ tier: completedTier, txn });
        }, 1600);
      },
    }).catch(() => undefined);
  }
  return paddlePromise;
}

/**
 * Opens the Paddle overlay checkout for a self-serve tier.
 *
 * Resolves with `error: ''` once the overlay is up (the page stays mounted
 * underneath — closing the overlay just returns the visitor to it). When the
 * payment completes, `handleCompleted` fires with the params for the success
 * page.
 */
export async function startCheckout(
  tier: string,
  handleCompleted: (result: CheckoutResult) => void,
): Promise<{ error: string }> {
  const priceId = PRICE_IDS[tier];
  if (!priceId) return { error: GENERIC_ERROR };

  const paddle = await getPaddle();
  if (!paddle) return { error: GENERIC_ERROR };

  onCompleted = handleCompleted;
  completedTier = tier;
  try {
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { tier },
    });
    return { error: '' };
  } catch {
    onCompleted = null;
    return { error: 'Something went wrong reaching checkout. Please try again in a moment.' };
  }
}

/**
 * Opens Paddle's hosted customer portal for the subscription created by this
 * transaction, so the customer can update their card, get invoices, or cancel.
 * Access is proven by possession of the transaction id, which is only handed
 * to the person who completed that checkout (it lands in their success URL).
 * Only resolves on failure — on success the browser navigates away.
 */
export async function openBillingPortal(transactionId: string): Promise<{ error: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('paddle-portal-session', {
      body: { transaction_id: transactionId },
    });

    const url = (data as { url?: string } | null)?.url;
    if (error || !url) {
      return { error: "We couldn't open the billing portal. Email hello@13design.org and we'll sort it out." };
    }

    window.location.href = url;
    return await new Promise<{ error: string }>(() => {});
  } catch {
    return { error: 'Something went wrong opening the billing portal. Please try again in a moment.' };
  }
}
