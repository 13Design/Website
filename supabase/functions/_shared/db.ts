// Service-role Supabase client + the dedup ledger shared by the webhooks.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/**
 * At-least-once delivery guard. Returns true the first time (source, key) is
 * seen and false on every replay, by relying on the primary-key conflict:
 * `insert ... ignore-duplicates` reports 0 rows when the key already exists.
 *
 * Fail-open: if the ledger write itself errors we treat the event as new so a
 * transient DB blip never silently drops a real event.
 */
export async function claimEvent(
  supabase: SupabaseClient,
  source: string,
  key: string,
): Promise<boolean> {
  if (!key) return true;
  const { data, error } = await supabase
    .from("processed_events")
    .upsert({ source, event_key: key }, { onConflict: "source,event_key", ignoreDuplicates: true })
    .select("event_key");
  if (error) {
    console.error("claimEvent ledger error (processing anyway):", error.message);
    return true;
  }
  return (data?.length ?? 0) > 0;
}
