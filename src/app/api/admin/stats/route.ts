import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAdminStats());
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}
