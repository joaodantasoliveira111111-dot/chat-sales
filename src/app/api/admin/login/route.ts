import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminSession,
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/adminAuth";
import { jsonError } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = loginSchema.parse(await request.json());

  if (!validateAdminCredentials(body.username, body.password)) {
    return jsonError("Login ou senha invalidos.", 401);
  }

  await createAdminSession(body.username);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
