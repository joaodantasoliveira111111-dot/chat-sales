import {
  defaultChatSteps,
  defaultFaqs,
  defaultInventoryItem,
  defaultProduct,
} from "@/lib/defaults";
import type {
  AdminStats,
  ChatStep,
  Delivery,
  DeliveryPayload,
  Faq,
  InventoryItem,
  InventoryStatus,
  Order,
  OrderStatus,
  Product,
} from "@/lib/types";

type MockState = {
  products: Product[];
  chatSteps: ChatStep[];
  faqs: Faq[];
  inventoryItems: InventoryItem[];
  orders: Order[];
  deliveries: Delivery[];
};

const globalForMock = globalThis as typeof globalThis & {
  __acessoProMockStore?: MockState;
};

export function getMockStore() {
  if (!globalForMock.__acessoProMockStore) {
    globalForMock.__acessoProMockStore = {
      products: [defaultProduct],
      chatSteps: [...defaultChatSteps],
      faqs: [...defaultFaqs],
      inventoryItems: [defaultInventoryItem],
      orders: [],
      deliveries: [],
    };
  }

  return globalForMock.__acessoProMockStore;
}

export function createId(prefix?: string) {
  void prefix;
  return crypto.randomUUID();
}

export function getMockStats(): AdminStats {
  const store = getMockStore();
  const paidStatuses: OrderStatus[] = ["paid", "delivered", "paid_pending_stock"];
  const paidOrders = store.orders.filter((order) =>
    paidStatuses.includes(order.status),
  );
  const totalFinished = store.orders.filter((order) =>
    ["paid", "delivered", "cancelled", "expired", "refunded"].includes(
      order.status,
    ),
  ).length;

  return {
    totalOrders: store.orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: store.orders.filter((order) => order.status === "pending")
      .length,
    revenue: paidOrders.reduce((sum, order) => sum + Number(order.amount), 0),
    activeProducts: store.products.filter((product) => product.is_active).length,
    availableItems: store.inventoryItems.filter(
      (item) => item.status === "available",
    ).length,
    soldItems: store.inventoryItems.filter((item) => item.status === "delivered")
      .length,
    conversionRate: totalFinished
      ? Math.round((paidOrders.length / totalFinished) * 100)
      : 0,
  };
}

export function upsertById<T extends { id: string }>(items: T[], value: T) {
  const index = items.findIndex((item) => item.id === value.id);
  if (index >= 0) {
    items[index] = value;
    return value;
  }
  items.push(value);
  return value;
}

export function buildDeliveryPayload(
  order: Order,
  product: Product,
  item: InventoryItem,
): DeliveryPayload {
  return {
    product_name: product.name,
    access_email: item.access_email,
    access_password: item.access_password,
    access_url: item.access_url,
    instructions: product.default_instructions,
    extra_instructions: item.extra_instructions,
  };
}

export function setInventoryStatus(
  item: InventoryItem,
  status: InventoryStatus,
  orderId?: string,
) {
  item.status = status;
  item.assigned_order_id = orderId ?? item.assigned_order_id;
  item.delivered_at = status === "delivered" ? new Date().toISOString() : null;
  return item;
}
