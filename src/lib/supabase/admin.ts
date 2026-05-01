import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseServerEnv } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
