"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseKey, hasSupabaseBrowserEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublicSupabaseKey(),
  );
}
