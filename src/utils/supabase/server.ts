import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

/**
 * Server-only client. There is no login for v1 (single-founder tool), so
 * every query runs through this key from Server Components/Actions only —
 * it must never be imported into a "use client" file, or it ships to the
 * browser and the permissive RLS policies on these tables become public.
 */
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey);
