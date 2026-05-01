import { NextResponse } from "next/server";
import { getOrder, getOrderDelivery } from "@/lib/data/store";
import { jsonError } from "@/lib/api";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const order = await getOrder(id);

  if (!order || (sessionId && order.session_id !== sessionId)) {
    return jsonError("Pedido nao encontrado.", 404);
  }

  if (order.status !== "delivered") {
    return jsonError("Entrega ainda nao liberada.", 403);
  }

  const delivery = await getOrderDelivery(id, sessionId);
  return NextResponse.json({ delivery });
}
