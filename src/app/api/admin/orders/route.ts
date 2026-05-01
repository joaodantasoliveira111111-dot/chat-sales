import { NextResponse } from "next/server";
import { listOrders } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ orders: await listOrders() });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}
