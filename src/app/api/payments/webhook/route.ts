import { NextResponse } from "next/server";
import { findOrderByPaymentId, markPaymentApproved, updateOrderStatus } from "@/lib/data/store";
import { handleWebhook } from "@/lib/payment/paymentProvider";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { jsonError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = await handleWebhook(
      payload,
      request.headers.get("x-webhook-signature"),
    );
    const order = await findOrderByPaymentId(parsed.paymentId);

    if (!order) {
      return jsonError("Pedido nao encontrado para este pagamento.", 404);
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("payment_events").insert({
        order_id: order.id,
        provider: process.env.PAYMENT_PROVIDER || "mock",
        event_type: parsed.status,
        payload: parsed.raw,
      });
    }

    if (parsed.status === "paid") {
      const result = await markPaymentApproved(order.id);
      return NextResponse.json(result);
    }

    if (parsed.status === "expired") {
      const expired = await updateOrderStatus(order.id, "expired");
      return NextResponse.json({ order: expired });
    }

    if (parsed.status === "cancelled") {
      const cancelled = await updateOrderStatus(order.id, "cancelled");
      return NextResponse.json({ order: cancelled });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Webhook invalido.",
      400,
    );
  }
}
