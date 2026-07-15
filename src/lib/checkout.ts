import { supabase } from './supabase';

/**
 * Starts Stripe Checkout for a self-serve tier and redirects the browser to it.
 *
 * Only resolves if something went wrong — on success the browser navigates away.
 * The server decides which tiers are purchasable; Embedded is rejected there.
 */
export async function startCheckout(tier: string): Promise<{ error: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { tier },
    });

    if (error) {
      return { error: "We couldn't open checkout. Please try again, or email hello@13design.studio." };
    }

    const url = (data as { url?: string } | null)?.url;
    if (!url) {
      return { error: "We couldn't open checkout. Please try again, or email hello@13design.studio." };
    }

    window.location.href = url;
    // Redirecting — give the browser a beat rather than flashing an error.
    return await new Promise<{ error: string }>(() => {});
  } catch {
    return { error: 'Something went wrong reaching checkout. Please try again in a moment.' };
  }
}
