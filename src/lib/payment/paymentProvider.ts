import QRCode from "qrcode";
import type { Order } from "@/lib/types";

export type PixPayment = {
  paymentId: string;
  pixCode: string;
  qrCodeUrl: string;
  status: "pending" | "paid" | "expired" | "cancelled";
};

export type PaymentWebhookResult = {
  paymentId: string;
  status: PixPayment["status"];
  raw: unknown;
};

export async function createPixPayment(order: Order): Promise<PixPayment> {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  if (provider !== "mock") {
    return createGatewayPixPayment(order);
  }

  const pixCode = [
    "000201",
    "26580014br.gov.bcb.pix",
    `520400005303986540${Number(order.amount).toFixed(2)}`,
    "5802BR",
    "5909ACESSOPRO",
    "6009SAO PAULO",
    `62070503${order.id.slice(-8)}`,
    "6304MOCK",
  ].join("");

  return {
    paymentId: `mock_${order.id}`,
    pixCode,
    qrCodeUrl: await QRCode.toDataURL(pixCode, {
      margin: 1,
      width: 260,
      color: {
        dark: "#0B0F14",
        light: "#FFFFFF",
      },
    }),
    status: "pending",
  };
}

export async function getPaymentStatus(paymentId: string) {
  if ((process.env.PAYMENT_PROVIDER || "mock") === "mock") {
    return paymentId.startsWith("mock_") ? "pending" : "pending";
  }

  const response = await fetch(
    `${process.env.PAYMENT_API_URL}/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Falha ao consultar status no gateway.");
  }

  const payload = await response.json();
  return normalizeGatewayStatus(payload.status);
}

export async function handleWebhook(
  payload: unknown,
  signature?: string | null,
): Promise<PaymentWebhookResult> {
  const provider = process.env.PAYMENT_PROVIDER || "mock";
  if (provider !== "mock" && process.env.WEBHOOK_SECRET) {
    // Gateways reais costumam exigir HMAC. Implemente aqui conforme a doc do provedor escolhido.
    if (!signature) {
      throw new Error("Assinatura do webhook ausente.");
    }
  }

  const typed = payload as Record<string, unknown>;
  const paymentId =
    String(typed.payment_id ?? typed.paymentId ?? typed.id ?? "") || "";
  const status = normalizeGatewayStatus(String(typed.status ?? "pending"));

  if (!paymentId) {
    throw new Error("Webhook sem payment_id.");
  }

  return {
    paymentId,
    status,
    raw: payload,
  };
}

async function createGatewayPixPayment(order: Order): Promise<PixPayment> {
  if (!process.env.PAYMENT_API_URL || !process.env.PAYMENT_API_KEY) {
    throw new Error("Credenciais do gateway Pix nao configuradas.");
  }

  const response = await fetch(`${process.env.PAYMENT_API_URL}/pix/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: order.id,
      amount: order.amount,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_whatsapp,
      },
      webhook_url: process.env.PAYMENT_WEBHOOK_URL,
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao criar Pix no gateway configurado.");
  }

  const payload = await response.json();
  const pixCode = String(payload.pix_code ?? payload.qr_code ?? "");

  return {
    paymentId: String(payload.id ?? payload.payment_id),
    pixCode,
    qrCodeUrl:
      String(payload.qr_code_url ?? payload.qr_code_base64 ?? "") ||
      (await QRCode.toDataURL(pixCode)),
    status: normalizeGatewayStatus(String(payload.status ?? "pending")),
  };
}

function normalizeGatewayStatus(status: string): PixPayment["status"] {
  const normalized = status.toLowerCase();
  if (["paid", "approved", "confirmed", "completed"].includes(normalized)) {
    return "paid";
  }
  if (["expired", "failed"].includes(normalized)) return "expired";
  if (["cancelled", "canceled"].includes(normalized)) return "cancelled";
  return "pending";
}
