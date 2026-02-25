import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser Supabase client using cookies for auth (via @supabase/ssr).
 * Singleton to avoid Navigator Lock contention.
 */
export function createClient() {
  if (clientInstance) return clientInstance;
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return clientInstance;
}

export type SupabaseClient = ReturnType<typeof createClient>;
