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

  const delivery =
    order.status === "delivered" ? await getOrderDelivery(id, sessionId) : null;

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    amount: order.amount,
    pixCode: order.pix_code,
    qrCodeUrl: order.qr_code_url,
    expiresAt: order.expires_at,
    delivery,
  });
}
