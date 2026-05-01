import { NextResponse } from "next/server";
import { listInventory, saveInventoryItem } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const status = new URL(request.url).searchParams.get("status") ?? undefined;
    return NextResponse.json({ inventory: await listInventory(status) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const item = await saveInventoryItem(await request.json());
    return NextResponse.json({ item });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
