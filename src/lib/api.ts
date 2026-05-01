import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Nao autenticado.");
  }
  return user;
}
