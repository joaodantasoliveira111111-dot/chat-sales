import { NextResponse } from "next/server";
import { getOrder, updateOrderStatus } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const order = await getOrder(id);
    if (!order) return jsonError("Pedido nao encontrado.", 404);
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const { status } = (await request.json()) as { status: OrderStatus };
    const order = await updateOrderStatus(id, status);
    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao atualizar.");
  }
}
