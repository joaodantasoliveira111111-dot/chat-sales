import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, attachPaymentToOrder, getPublicProduct } from "@/lib/data/store";
import { createPixPayment } from "@/lib/payment/paymentProvider";
import { jsonError } from "@/lib/api";

const createPaymentSchema = z.object({
  productSlug: z.string().min(1).default("capcut-pro"),
  sessionId: z.string().min(8),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerWhatsapp: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = createPaymentSchema.parse(await request.json());
    const { product } = await getPublicProduct(body.productSlug);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const order = await createOrder({
      product,
      sessionId: body.sessionId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerWhatsapp: body.customerWhatsapp,
      expiresAt,
    });
    const payment = await createPixPayment(order);
    const updatedOrder = await attachPaymentToOrder(order.id, payment);

    return NextResponse.json({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      pixCode: payment.pixCode,
      qrCodeUrl: payment.qrCodeUrl,
      paymentId: payment.paymentId,
      amount: updatedOrder.amount,
      expiresAt: updatedOrder.expires_at,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Nao foi possivel gerar o Pix.",
      422,
    );
  }
}
