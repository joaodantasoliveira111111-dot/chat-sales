import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicSupabaseKey, hasSupabaseBrowserEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!hasSupabaseBrowserEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublicSupabaseKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always write cookies. Proxy handles refresh.
          }
        },
      },
    },
  );
}

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      id: "local-demo-admin",
      email: "local@acessopro.dev",
    };
  }

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    return null;
  }

  return {
    id: data.claims.sub,
    email:
      typeof data.claims.email === "string"
        ? data.claims.email
        : "admin@acessopro.local",
  };
}
