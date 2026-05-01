import { NextResponse } from "next/server";
import { markPaymentApproved } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    if ((process.env.PAYMENT_PROVIDER || "mock") !== "mock") {
      return jsonError("Simulacao disponivel apenas com PAYMENT_PROVIDER=mock.");
    }
    const { id } = await context.params;
    return NextResponse.json(await markPaymentApproved(id));
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Nao foi possivel simular pagamento.",
    );
  }
}
