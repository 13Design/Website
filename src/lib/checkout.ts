import { supabase } from './supabase';

/**
 * Starts Stripe Checkout for a self-serve tier and redirects the browser to it.
 *
 * Only resolves if something went wrong — on success the browser navigates away.
 * The server decides which tiers are purchasable; Embedded is rejected there.
 */
/**
 * Opens Stripe's hosted Customer Portal for the subscription created by this
 * Checkout session, so the customer can update their card, get invoices, or
 * cancel. Only resolves on failure — on success the browser navigates away.
 */
export async function openBillingPortal(sessionId: string): Promise<{ error: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { session_id: sessionId },
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

export async function startCheckout(tier: string): Promise<{ error: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { tier },
    });

    if (error) {
      return { error: "We couldn't open checkout. Please try again, or email hello@13design.org." };
    }

    const url = (data as { url?: string } | null)?.url;
    if (!url) {
      return { error: "We couldn't open checkout. Please try again, or email hello@13design.org." };
    }

    window.location.href = url;
    // Redirecting — give the browser a beat rather than flashing an error.
    return await new Promise<{ error: string }>(() => {});
  } catch {
    return { error: 'Something went wrong reaching checkout. Please try again in a moment.' };
  }
}
