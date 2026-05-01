import { NextResponse } from "next/server";
import { listChatSteps, saveChatStep } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const productId = new URL(request.url).searchParams.get("product_id") ?? undefined;
    return NextResponse.json({ chatSteps: await listChatSteps(productId) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const chatStep = await saveChatStep(await request.json());
    return NextResponse.json({ chatStep });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
