export type ProductDeliveryType =
  | "digital_credential"
  | "file"
  | "link"
  | "custom_text";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  is_active: boolean;
  delivery_type: ProductDeliveryType;
  image_url: string | null;
  support_text: string | null;
  default_instructions: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ChatButtonAction =
  | "next_step"
  | "open_checkout"
  | "open_faq"
  | "external_link"
  | "support";

export type ChatStep = {
  id: string;
  product_id: string;
  step_order: number;
  message_text: string;
  primary_button_text: string | null;
  primary_button_action: ChatButtonAction;
  secondary_button_text: string | null;
  secondary_button_action: ChatButtonAction | null;
  delay_ms: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Faq = {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  order: number;
  is_active: boolean;
};

export type InventoryStatus =
  | "available"
  | "reserved"
  | "delivered"
  | "disabled"
  | "replaced";

export type InventoryItem = {
  id: string;
  product_id: string;
  title: string | null;
  access_email: string | null;
  access_password: string | null;
  access_url: string | null;
  extra_instructions: string | null;
  status: InventoryStatus;
  assigned_order_id: string | null;
  delivered_at: string | null;
  created_at?: string;
  updated_at?: string;
  products?: Pick<Product, "name" | "slug"> | null;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "expired"
  | "cancelled"
  | "refunded"
  | "paid_pending_stock";

export type Order = {
  id: string;
  product_id: string;
  session_id: string;
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string | null;
  amount: number;
  status: OrderStatus;
  gateway_payment_id: string | null;
  pix_code: string | null;
  qr_code_url: string | null;
  delivered_item_id: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  expires_at: string | null;
  created_at?: string;
  updated_at?: string;
  products?: Pick<Product, "name" | "slug" | "default_instructions"> | null;
};

export type Delivery = {
  id: string;
  order_id: string;
  product_id: string;
  inventory_item_id: string | null;
  delivery_payload: DeliveryPayload;
  created_at?: string;
};

export type DeliveryPayload = {
  product_name: string;
  access_email?: string | null;
  access_password?: string | null;
  access_url?: string | null;
  instructions?: string | null;
  extra_instructions?: string | null;
};

export type PublicProductPayload = {
  product: Product;
  chatSteps: ChatStep[];
  faqs: Faq[];
};

export type AdminStats = {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  revenue: number;
  activeProducts: number;
  availableItems: number;
  soldItems: number;
  conversionRate: number;
};
