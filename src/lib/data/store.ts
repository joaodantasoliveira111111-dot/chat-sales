import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getAdminCredentials } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPublicSupabaseKey, hasSupabaseBrowserEnv } from "@/lib/env";
import {
  buildDeliveryPayload,
  createId,
  getMockStats,
  getMockStore,
  setInventoryStatus,
  upsertById,
} from "@/lib/data/mockStore";
import type {
  AdminStats,
  ChatStep,
  Delivery,
  DeliveryPayload,
  Faq,
  InventoryItem,
  Order,
  OrderStatus,
  PaymentGatewaySettings,
  Product,
  PublicProductPayload,
} from "@/lib/types";

function supabaseOrNull() {
  return getSupabaseAdmin();
}

function publicSupabaseOrNull() {
  if (!hasSupabaseBrowserEnv()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getPublicSupabaseKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export async function getPublicProduct(
  slug = "capcut-pro",
): Promise<PublicProductPayload> {
  const supabase = supabaseOrNull() ?? publicSupabaseOrNull();

  if (!supabase) {
    const store = getMockStore();
    const product =
      store.products.find((item) => item.slug === slug && item.is_active) ??
      store.products[0];

    return {
      product,
      chatSteps: store.chatSteps
        .filter((step) => step.product_id === product.id && step.is_active)
        .sort((a, b) => a.step_order - b.step_order),
      faqs: store.faqs
        .filter((faq) => faq.product_id === product.id && faq.is_active)
        .sort((a, b) => a.order - b.order),
    };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (productError || !product) {
    throw new Error("Produto indisponivel.");
  }

  const [{ data: chatSteps }, { data: faqs }] = await Promise.all([
    supabase
      .from("chat_steps")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("step_order", { ascending: true }),
    supabase
      .from("faqs")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("order", { ascending: true }),
  ]);

  return {
    product: product as Product,
    chatSteps: (chatSteps ?? []) as ChatStep[],
    faqs: (faqs ?? []) as Faq[],
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = supabaseOrNull() ?? publicSupabaseOrNull();
  if (!supabase) {
    return getMockStats();
  }

  const [
    { data: orders },
    { data: products },
    { data: inventory },
    { data: funnelEvents },
  ] = await Promise.all([
      supabase.from("orders").select("status, amount"),
      supabase.from("products").select("is_active"),
      supabase.from("inventory_items").select("status"),
      supabase.from("funnel_events").select("session_id, event_type"),
    ]);

  const allOrders = (orders ?? []) as Pick<Order, "status" | "amount">[];
  const paidStatuses: OrderStatus[] = ["paid", "delivered", "paid_pending_stock"];
  const paidOrders = allOrders.filter((order) =>
    paidStatuses.includes(order.status),
  );
  const finishedOrders = allOrders.filter((order) =>
    ["paid", "delivered", "expired", "cancelled", "refunded"].includes(
      order.status,
    ),
  );
  const events = (funnelEvents ?? []) as Array<{
    session_id: string;
    event_type: string;
  }>;
  const visitors = new Set(
    events
      .filter((event) => event.event_type === "view")
      .map((event) => event.session_id),
  ).size;
  const pixGenerated = allOrders.length;
  const funnelVisitors = Math.max(visitors, pixGenerated);

  return {
    funnelVisitors,
    pixGenerated,
    paidConversionRate: pixGenerated
      ? Math.round((paidOrders.length / pixGenerated) * 100)
      : 0,
    pixConversionRate: funnelVisitors
      ? Math.round((pixGenerated / funnelVisitors) * 100)
      : 0,
    totalOrders: allOrders.length,
    paidOrders: paidOrders.length,
    pendingOrders: allOrders.filter((order) => order.status === "pending").length,
    revenue: paidOrders.reduce((sum, order) => sum + Number(order.amount), 0),
    activeProducts: (products ?? []).filter((product) => product.is_active)
      .length,
    availableItems: (inventory ?? []).filter((item) => item.status === "available")
      .length,
    soldItems: (inventory ?? []).filter((item) => item.status === "delivered")
      .length,
    conversionRate: finishedOrders.length
      ? Math.round((paidOrders.length / finishedOrders.length) * 100)
      : 0,
  };
}

export async function trackFunnelEvent(input: {
  sessionId: string;
  productId: string;
  eventType: "view" | "step" | "checkout" | "pix_generated" | "paid";
  stepId?: string | null;
}) {
  const supabase = supabaseOrNull() ?? publicSupabaseOrNull();
  if (!supabase) return;

  await supabase.from("funnel_events").insert({
    session_id: input.sessionId,
    product_id: input.productId,
    event_type: input.eventType,
    step_id: input.stepId ?? null,
  });
}

export async function listProducts() {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return getMockStore().products;
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductById(id: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return getMockStore().products.find((product) => product.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Product;
}

export async function saveProduct(input: Partial<Product>) {
  const supabase = supabaseOrNull();
  const now = new Date().toISOString();
  const product: Product = {
    id: input.id ?? createId("product"),
    name: input.name ?? "Novo produto",
    slug: input.slug ?? createId("produto"),
    description: input.description ?? null,
    price: Number(input.price ?? 0),
    is_active: input.is_active ?? true,
    delivery_type: input.delivery_type ?? "digital_credential",
    image_url: input.image_url ?? null,
    support_text: input.support_text ?? null,
    default_instructions: input.default_instructions ?? null,
    updated_at: now,
    created_at: input.created_at ?? now,
  };

  if (!supabase) {
    return upsertById(getMockStore().products, product);
  }

  const { data, error } = await supabase
    .from("products")
    .upsert(product)
    .select("*")
    .single();
  if (error) throw error;
  return data as Product;
}

export async function listChatSteps(productId?: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return getMockStore().chatSteps
      .filter((step) => !productId || step.product_id === productId)
      .sort((a, b) => a.step_order - b.step_order);
  }

  let query = supabase
    .from("chat_steps")
    .select("*")
    .order("step_order", { ascending: true });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ChatStep[];
}

export async function saveChatStep(input: Partial<ChatStep>) {
  const productId =
    input.product_id ?? (await listProducts())[0]?.id ?? "missing-product";
  const step: ChatStep = {
    id: input.id ?? createId("step"),
    product_id: productId,
    step_order: Number(input.step_order ?? 1),
    message_text: input.message_text ?? "",
    media_type: input.media_type ?? "none",
    media_url: input.media_url ?? null,
    media_alt: input.media_alt ?? null,
    node_id: input.node_id ?? null,
    position_x: Number(input.position_x ?? 80),
    position_y: Number(input.position_y ?? 80),
    next_step_id: input.next_step_id ?? null,
    secondary_step_id: input.secondary_step_id ?? null,
    primary_button_text: input.primary_button_text ?? null,
    primary_button_action: input.primary_button_action ?? "next_step",
    secondary_button_text: input.secondary_button_text ?? null,
    secondary_button_action: input.secondary_button_action ?? null,
    delay_ms: Number(input.delay_ms ?? 600),
    is_active: input.is_active ?? true,
  };

  const supabase = supabaseOrNull();
  if (!supabase) {
    return upsertById(getMockStore().chatSteps, step);
  }
  const { data, error } = await supabase
    .from("chat_steps")
    .upsert(step)
    .select("*")
    .single();
  if (error) throw error;
  return data as ChatStep;
}

export async function getPaymentGatewaySettings(): Promise<PaymentGatewaySettings> {
  const fallback: PaymentGatewaySettings = {
    activeProvider:
      (process.env.PAYMENT_PROVIDER as PaymentGatewaySettings["activeProvider"]) ||
      "mock",
    mode:
      (process.env.PAYMENT_PROVIDER_MODE as PaymentGatewaySettings["mode"]) ||
      "production",
    webhookUrl:
      process.env.PAYMENT_WEBHOOK_URL ||
      "http://localhost:3000/api/payments/webhook",
    qrImageApiUrl:
      process.env.QR_IMAGE_API_URL ||
      "https://api.qrserver.com/v1/create-qr-code/",
    pushinpayApiKey: process.env.PUSHINPAY_API_KEY || process.env.PAYMENT_API_KEY,
    amplopayPublicKey: process.env.AMPLOPAY_PUBLIC_KEY,
    amplopaySecretKey: process.env.AMPLOPAY_SECRET_KEY,
  };

  const supabase = supabaseOrNull() ?? publicSupabaseOrNull();
  if (!supabase) return fallback;

  const { data } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", "payment_gateway")
    .maybeSingle();

  return {
    ...fallback,
    ...openSettingsValue(data?.value),
  };
}

export async function savePaymentGatewaySettings(
  settings: PaymentGatewaySettings,
) {
  const supabase = supabaseOrNull() ?? publicSupabaseOrNull();
  if (!supabase) return settings;

  const { data, error } = await supabase
    .from("admin_settings")
    .upsert(
      {
        key: "payment_gateway",
        value: sealSettingsValue(settings),
      },
      { onConflict: "key" },
    )
    .select("value")
    .single();

  if (error) throw error;
  return openSettingsValue(data.value) as PaymentGatewaySettings;
}

function sealSettingsValue(settings: PaymentGatewaySettings) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", settingsCryptoKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(settings), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    sealed: true,
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    data: encrypted.toString("base64url"),
  };
}

function openSettingsValue(value: unknown): Partial<PaymentGatewaySettings> {
  const maybeSealed = value as
    | { sealed?: boolean; iv?: string; tag?: string; data?: string }
    | null
    | undefined;

  if (!maybeSealed?.sealed) {
    return (value ?? {}) as Partial<PaymentGatewaySettings>;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      settingsCryptoKey(),
      Buffer.from(maybeSealed.iv ?? "", "base64url"),
    );
    decipher.setAuthTag(Buffer.from(maybeSealed.tag ?? "", "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(maybeSealed.data ?? "", "base64url")),
      decipher.final(),
    ]).toString("utf8");

    return JSON.parse(decrypted) as Partial<PaymentGatewaySettings>;
  } catch {
    return {};
  }
}

function settingsCryptoKey() {
  return createHash("sha256").update(getAdminCredentials().secret).digest();
}

export async function listFaqs(productId?: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return getMockStore().faqs
      .filter((faq) => !productId || faq.product_id === productId)
      .sort((a, b) => a.order - b.order);
  }

  let query = supabase.from("faqs").select("*").order("order", { ascending: true });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Faq[];
}

export async function saveFaq(input: Partial<Faq>) {
  const productId =
    input.product_id ?? (await listProducts())[0]?.id ?? "missing-product";
  const faq: Faq = {
    id: input.id ?? createId("faq"),
    product_id: productId,
    question: input.question ?? "",
    answer: input.answer ?? "",
    order: Number(input.order ?? 1),
    is_active: input.is_active ?? true,
  };

  const supabase = supabaseOrNull();
  if (!supabase) {
    return upsertById(getMockStore().faqs, faq);
  }
  const { data, error } = await supabase
    .from("faqs")
    .upsert(faq)
    .select("*")
    .single();
  if (error) throw error;
  return data as Faq;
}

export async function listInventory(status?: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return getMockStore().inventoryItems.filter(
      (item) => !status || item.status === status,
    );
  }

  let query = supabase
    .from("inventory_items")
    .select("*, products(name, slug)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InventoryItem[];
}

export async function saveInventoryItem(input: Partial<InventoryItem>) {
  const productId =
    input.product_id ?? (await listProducts())[0]?.id ?? "missing-product";
  const item: InventoryItem = {
    id: input.id ?? createId("inventory"),
    product_id: productId,
    title: input.title ?? "Acesso digital",
    access_email: input.access_email ?? null,
    access_password: input.access_password ?? null,
    access_url: input.access_url ?? null,
    extra_instructions: input.extra_instructions ?? null,
    status: input.status ?? "available",
    assigned_order_id: input.assigned_order_id ?? null,
    delivered_at: input.delivered_at ?? null,
  };

  const supabase = supabaseOrNull();
  if (!supabase) {
    return upsertById(getMockStore().inventoryItems, item);
  }
  const { data, error } = await supabase
    .from("inventory_items")
    .upsert(item)
    .select("*")
    .single();
  if (error) throw error;
  return data as InventoryItem;
}

export async function listOrders() {
  const supabase = supabaseOrNull();
  if (!supabase) {
    const store = getMockStore();
    return store.orders
      .map((order) => ({
        ...order,
        products:
          store.products.find((product) => product.id === order.product_id) ??
          null,
      }))
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*, products(name, slug, default_instructions)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrder(orderId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    const store = getMockStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) return null;
    return {
      ...order,
      products:
        store.products.find((product) => product.id === order.product_id) ?? null,
    };
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*, products(name, slug, default_instructions)")
    .eq("id", orderId)
    .single();
  if (error) return null;
  return data as Order;
}

export async function createOrder(input: {
  product: Product;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp?: string | null;
  expiresAt: string;
}) {
  const now = new Date().toISOString();
  const order: Order = {
    id: createId("order"),
    product_id: input.product.id,
    session_id: input.sessionId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_whatsapp: input.customerWhatsapp ?? null,
    amount: Number(input.product.price),
    status: "pending",
    gateway_payment_id: null,
    pix_code: null,
    qr_code_url: null,
    delivered_item_id: null,
    paid_at: null,
    delivered_at: null,
    expires_at: input.expiresAt,
    created_at: now,
    updated_at: now,
  };

  const supabase = supabaseOrNull();
  if (!supabase) {
    getMockStore().orders.push(order);
    return order;
  }
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function attachPaymentToOrder(
  orderId: string,
  payment: { paymentId: string; pixCode: string; qrCodeUrl: string },
) {
  const supabase = supabaseOrNull();
  const update = {
    gateway_payment_id: payment.paymentId,
    pix_code: payment.pixCode,
    qr_code_url: payment.qrCodeUrl,
  };
  if (!supabase) {
    const order = getMockStore().orders.find((item) => item.id === orderId);
    if (!order) throw new Error("Pedido nao encontrado.");
    Object.assign(order, update);
    return order;
  }
  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra: Partial<Order> = {},
) {
  const supabase = supabaseOrNull();
  const update = {
    status,
    ...extra,
    updated_at: new Date().toISOString(),
  };
  if (!supabase) {
    const order = getMockStore().orders.find((item) => item.id === orderId);
    if (!order) throw new Error("Pedido nao encontrado.");
    Object.assign(order, update);
    return order;
  }
  const { data, error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function getOrderDelivery(orderId: string, sessionId?: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    const store = getMockStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order || (sessionId && order.session_id !== sessionId)) return null;
    const delivery = store.deliveries.find((item) => item.order_id === orderId);
    return delivery?.delivery_payload ?? null;
  }

  let orderQuery = supabase.from("orders").select("id").eq("id", orderId);
  if (sessionId) orderQuery = orderQuery.eq("session_id", sessionId);
  const { data: order } = await orderQuery.single();
  if (!order) return null;

  const { data } = await supabase
    .from("deliveries")
    .select("delivery_payload")
    .eq("order_id", orderId)
    .single();
  return (data?.delivery_payload ?? null) as DeliveryPayload | null;
}

export async function deliverDigitalItem(orderId: string) {
  const supabase = supabaseOrNull();
  const paidAt = new Date().toISOString();

  if (!supabase) {
    const store = getMockStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) throw new Error("Pedido nao encontrado.");
    if (!["paid", "delivered"].includes(order.status)) {
      throw new Error("Pedido ainda nao esta pago.");
    }
    const existing = store.deliveries.find((item) => item.order_id === orderId);
    if (existing) return existing.delivery_payload;

    const product = store.products.find((item) => item.id === order.product_id);
    const item = store.inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.product_id === order.product_id &&
        inventoryItem.status === "available",
    );

    if (!product || !item) {
      order.status = "paid_pending_stock";
      order.paid_at = order.paid_at ?? paidAt;
      return null;
    }

    setInventoryStatus(item, "delivered", order.id);
    const payload = buildDeliveryPayload(order, product, item);
    const delivery: Delivery = {
      id: createId("delivery"),
      order_id: order.id,
      product_id: product.id,
      inventory_item_id: item.id,
      delivery_payload: payload,
      created_at: paidAt,
    };
    store.deliveries.push(delivery);
    order.status = "delivered";
    order.paid_at = order.paid_at ?? paidAt;
    order.delivered_at = paidAt;
    order.delivered_item_id = item.id;
    return payload;
  }

  const order = await getOrder(orderId);
  if (!order || !["paid", "delivered"].includes(order.status)) {
    throw new Error("Pedido nao encontrado ou ainda nao pago.");
  }

  const existing = await getOrderDelivery(orderId);
  if (existing) return existing;

  const { data: candidates, error: candidateError } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("product_id", order.product_id)
    .eq("status", "available")
    .is("assigned_order_id", null)
    .order("created_at", { ascending: true })
    .limit(5);

  if (candidateError) throw candidateError;

  let claimedItem: InventoryItem | null = null;
  for (const candidate of (candidates ?? []) as InventoryItem[]) {
    const { data: updated, error } = await supabase
      .from("inventory_items")
      .update({
        status: "delivered",
        assigned_order_id: orderId,
        delivered_at: paidAt,
      })
      .eq("id", candidate.id)
      .eq("status", "available")
      .is("assigned_order_id", null)
      .select("*")
      .maybeSingle();

    if (!error && updated) {
      claimedItem = updated as InventoryItem;
      break;
    }
  }

  if (!claimedItem) {
    await updateOrderStatus(orderId, "paid_pending_stock", {
      paid_at: order.paid_at ?? paidAt,
    });
    return null;
  }

  const product = (order.products ??
    (await getProductById(order.product_id))) as Product | null;
  if (!product) throw new Error("Produto do pedido nao encontrado.");

  const payload: DeliveryPayload = {
    product_name: product.name,
    access_email: claimedItem.access_email,
    access_password: claimedItem.access_password,
    access_url: claimedItem.access_url,
    instructions: product.default_instructions,
    extra_instructions: claimedItem.extra_instructions,
  };

  const { error: deliveryError } = await supabase.from("deliveries").insert({
    order_id: orderId,
    product_id: order.product_id,
    inventory_item_id: claimedItem.id,
    delivery_payload: payload,
  });
  if (deliveryError && deliveryError.code !== "23505") {
    throw deliveryError;
  }

  await updateOrderStatus(orderId, "delivered", {
    delivered_item_id: claimedItem.id,
    paid_at: order.paid_at ?? paidAt,
    delivered_at: paidAt,
  });

  return payload;
}

export async function markPaymentApproved(orderId: string) {
  const paidAt = new Date().toISOString();
  const order = await updateOrderStatus(orderId, "paid", { paid_at: paidAt });
  const delivery = await deliverDigitalItem(order.id);
  return { order: await getOrder(orderId), delivery };
}

export async function findOrderByPaymentId(paymentId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return (
      getMockStore().orders.find(
        (order) => order.gateway_payment_id === paymentId,
      ) ?? null
    );
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("gateway_payment_id", paymentId)
    .single();
  if (error) return null;
  return data as Order;
}
