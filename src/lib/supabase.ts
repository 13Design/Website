import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public Supabase client for the two inquiry forms. The anon key is safe in the
 * browser — row-level security allows anonymous INSERT only (no read-back), so
 * inserts must use return=minimal (i.e. .insert() without .select()).
 *
 * If the env vars are missing (e.g. a preview build without secrets), `supabase`
 * is null and the forms fall back to opening the visitor's email client.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
