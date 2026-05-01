import { getPaymentGatewaySettings } from "@/lib/data/store";
import type { Order, PaymentGatewaySettings, PaymentProviderKey } from "@/lib/types";

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
  const settings = await getPaymentGatewaySettings();
  const provider = settings.activeProvider;

  if (provider === "pushinpay") return createPushinPayPixPayment(order, settings);
  if (provider === "amplopay") return createAmploPayPixPayment(order, settings);
  return createMockPixPayment(order, settings);
}

export async function getPaymentStatus(paymentId: string) {
  const settings = await getPaymentGatewaySettings();

  if (settings.activeProvider === "pushinpay") {
    const payload = await requestJson(
      `${getPushinPayBaseUrl(settings)}/transactions/${paymentId}`,
      {
        headers: pushinPayHeaders(settings),
        cache: "no-store",
      },
    );
    return normalizeGatewayStatus(String(payload.status ?? "created"), "pushinpay");
  }

  if (settings.activeProvider === "amplopay") {
    const payload = await requestJson(
      `${getAmploPayBaseUrl(settings)}/gateway/transactions?id=${encodeURIComponent(paymentId)}`,
      {
        headers: amploPayHeaders(settings),
        cache: "no-store",
      },
    );
    return normalizeGatewayStatus(String(payload.status ?? "PENDING"), "amplopay");
  }

  return "pending";
}

export async function handleWebhook(
  payload: unknown,
  _signature?: string | null,
): Promise<PaymentWebhookResult> {
  void _signature;
  const settings = await getPaymentGatewaySettings();
  const typed = payload as Record<string, unknown>;

  if (settings.activeProvider === "amplopay" || typed.event) {
    const transaction = (typed.transaction ?? {}) as Record<string, unknown>;
    const paymentId = String(
      transaction.id ?? transaction.transactionId ?? typed.transactionId ?? typed.id ?? "",
    );
    const event = String(typed.event ?? transaction.status ?? "PENDING");

    if (!paymentId) throw new Error("Webhook AmploPay sem ID da transacao.");

    return {
      paymentId,
      status: normalizeGatewayStatus(event, "amplopay"),
      raw: payload,
    };
  }

  const paymentId = String(typed.id ?? typed.payment_id ?? typed.paymentId ?? "");
  const status = normalizeGatewayStatus(String(typed.status ?? "created"), "pushinpay");

  if (!paymentId) throw new Error("Webhook sem payment_id.");

  return {
    paymentId,
    status,
    raw: payload,
  };
}

async function createMockPixPayment(
  order: Order,
  settings: PaymentGatewaySettings,
): Promise<PixPayment> {
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
    qrCodeUrl: buildQrImageUrl(pixCode, settings),
    status: "pending",
  };
}

async function createPushinPayPixPayment(
  order: Order,
  settings: PaymentGatewaySettings,
): Promise<PixPayment> {
  const payload = await requestJson(`${getPushinPayBaseUrl(settings)}/pix/cashIn`, {
    method: "POST",
    headers: pushinPayHeaders(settings),
    body: JSON.stringify({
      value: Math.round(Number(order.amount) * 100),
      webhook_url: settings.webhookUrl,
      split_rules: [],
    }),
  });

  const pixDetails = payload.pix_details as Record<string, unknown> | undefined;
  const pixCode = String(payload.qr_code ?? pixDetails?.emv ?? "");
  if (!pixCode) throw new Error("PushinPay nao retornou Pix copia e cola.");

  return {
    paymentId: String(payload.id),
    pixCode,
    qrCodeUrl: buildQrImageUrl(pixCode, settings),
    status: normalizeGatewayStatus(String(payload.status ?? "created"), "pushinpay"),
  };
}

async function createAmploPayPixPayment(
  order: Order,
  settings: PaymentGatewaySettings,
): Promise<PixPayment> {
  const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const payload = await requestJson(`${getAmploPayBaseUrl(settings)}/gateway/pix/receive`, {
    method: "POST",
    headers: amploPayHeaders(settings),
    body: JSON.stringify({
      identifier: order.id,
      amount: Number(order.amount),
      client: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_whatsapp,
      },
      products: [
        {
          id: order.product_id,
          name: order.products?.name ?? "Produto digital",
          quantity: 1,
          price: Number(order.amount),
        },
      ],
      dueDate,
      metadata: {
        provider: "AcessoPro",
        orderId: order.id,
      },
      callbackUrl: settings.webhookUrl,
    }),
  });

  const pix = payload.pix as Record<string, unknown> | undefined;
  const pixInformation = payload.pixInformation as Record<string, unknown> | undefined;
  const pixCode = String(pix?.code ?? pixInformation?.qrCode ?? "");
  if (!pixCode) throw new Error("AmploPay nao retornou Pix copia e cola.");

  return {
    paymentId: String(payload.transactionId ?? payload.id),
    pixCode,
    qrCodeUrl: buildQrImageUrl(pixCode, settings),
    status: normalizeGatewayStatus(String(payload.status ?? "PENDING"), "amplopay"),
  };
}

function pushinPayHeaders(settings: PaymentGatewaySettings) {
  const token =
    settings.pushinpayApiKey ||
    process.env.PUSHINPAY_API_KEY ||
    process.env.PAYMENT_API_KEY;
  if (!token) throw new Error("PUSHINPAY_API_KEY nao configurada.");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function amploPayHeaders(settings: PaymentGatewaySettings) {
  const publicKey = settings.amplopayPublicKey || process.env.AMPLOPAY_PUBLIC_KEY;
  const secretKey = settings.amplopaySecretKey || process.env.AMPLOPAY_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new Error("AMPLOPAY_PUBLIC_KEY e AMPLOPAY_SECRET_KEY nao configuradas.");
  }

  return {
    "x-public-key": publicKey,
    "x-secret-key": secretKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function getPushinPayBaseUrl(settings: PaymentGatewaySettings) {
  if (process.env.PUSHINPAY_BASE_URL) return process.env.PUSHINPAY_BASE_URL;
  return settings.mode === "sandbox"
    ? "https://api-sandbox.pushinpay.com.br/api"
    : "https://api.pushinpay.com.br/api";
}

function getAmploPayBaseUrl(settings: PaymentGatewaySettings) {
  void settings;
  return process.env.AMPLOPAY_BASE_URL || "https://app.amplopay.com/api/v1";
}

function buildQrImageUrl(pixCode: string, settings: PaymentGatewaySettings) {
  const base = settings.qrImageApiUrl || "https://api.qrserver.com/v1/create-qr-code/";
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}size=260x260&format=png&data=${encodeURIComponent(pixCode)}`;
}

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : "Falha ao comunicar com gateway Pix.";
    throw new Error(message);
  }

  return payload as Record<string, unknown>;
}

function normalizeGatewayStatus(
  status: string,
  provider?: PaymentProviderKey,
): PixPayment["status"] {
  const normalized = status.toLowerCase();

  if (
    ["paid", "approved", "confirmed", "completed", "complete", "transaction_paid"].includes(
      normalized,
    ) ||
    (provider === "amplopay" && normalized === "completed")
  ) {
    return "paid";
  }

  if (["expired", "failed", "rejected", "transaction_refunded"].includes(normalized)) {
    return "expired";
  }

  if (["cancelled", "canceled", "transaction_canceled"].includes(normalized)) {
    return "cancelled";
  }

  return "pending";
}
