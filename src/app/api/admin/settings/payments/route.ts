import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPaymentGatewaySettings,
  savePaymentGatewaySettings,
} from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

const settingsSchema = z.object({
  activeProvider: z.enum(["mock", "pushinpay", "amplopay"]),
  mode: z.enum(["sandbox", "production"]),
  webhookUrl: z.string().url(),
  qrImageApiUrl: z.string().url(),
});

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({
      settings: await getPaymentGatewaySettings(),
      env: {
        pushinpayApiKey: Boolean(process.env.PUSHINPAY_API_KEY || process.env.PAYMENT_API_KEY),
        amplopayPublicKey: Boolean(process.env.AMPLOPAY_PUBLIC_KEY),
        amplopaySecretKey: Boolean(process.env.AMPLOPAY_SECRET_KEY),
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const settings = settingsSchema.parse(await request.json());
    return NextResponse.json({
      settings: await savePaymentGatewaySettings(settings),
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Erro ao salvar gateway.",
      422,
    );
  }
}
