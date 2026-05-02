// ============================================================
// CHATFY - TypeScript Types
// ============================================================

// ---- Auth / Profiles ----
export interface Profile {
  id: string
  user_id: string
  name: string | null
  email: string | null
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

// ---- Products ----
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived'
export type DeliveryType = 'digital_credential' | 'file' | 'link' | 'custom_text' | 'license_key' | 'manual'

export interface Product {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  status: ProductStatus
  delivery_type: DeliveryType | null
  image_url: string | null
  support_text: string | null
  default_instructions: string | null
  created_at: string
  updated_at: string
}

// ---- Themes ----
export interface ThemeConfig {
  background: string
  backgroundPattern?: string
  chatContainer: string
  chatContainerBorder: string
  assistantBubble: string
  assistantBubbleBorder: string
  assistantText: string
  userBubble: string
  userText: string
  button: string
  buttonText: string
  buttonHover: string
  headerBg: string
  headerText: string
  inputBg: string
  inputBorder: string
  inputText: string
  scrollbar: string
  typingDot: string
  borderRadius: string
  bubbleRadius: string
  shadow: string
  fontFamily: string
  backdropFilter: string
  assistantBubbleShadow?: string
  timestamp?: string
}

export interface Theme {
  id: string
  name: string
  description: string | null
  config: ThemeConfig
  is_system: boolean
  created_at: string
}

// ---- Flows ----
export type FlowStatus = 'draft' | 'published' | 'archived'

export interface Flow {
  id: string
  user_id: string
  product_id: string | null
  page_id: string | null
  name: string
  slug: string
  status: FlowStatus
  start_node_id: string | null
  version: number
  created_at: string
  updated_at: string
  published_at: string | null
}

// ---- Flow Nodes ----
export type NodeType =
  | 'start'
  | 'text_message'
  | 'button_message'
  | 'media_message'
  | 'input'
  | 'condition'
  | 'faq'
  | 'checkout'
  | 'pix_payment'
  | 'wait_payment'
  | 'delivery'
  | 'support'
  | 'action'
  | 'redirect'
  | 'end'

export interface FlowNodeConfig {
  // start
  next_node_id?: string
  // text_message
  message_text?: string
  delay_ms?: number
  show_typing?: boolean
  typing_duration_ms?: number
  avatar_visible?: boolean
  // button_message
  buttons?: FlowButton[]
  // media_message
  media_type?: 'image' | 'video' | 'audio'
  media_url?: string
  caption?: string
  // input
  label?: string
  placeholder?: string
  input_type?: 'text' | 'email' | 'phone' | 'number'
  required?: boolean
  variable_name?: string
  validation_rules?: Record<string, unknown>
  // condition
  conditions?: FlowCondition[]
  default_target_node_id?: string
  // faq
  faqs?: { question: string; answer: string }[]
  final_button_text?: string
  final_button_target_node_id?: string
  // checkout
  product_id?: string
  price_override?: number
  required_fields?: string[]
  summary_title?: string
  summary_text?: string
  button_text?: string
  success_target_node_id?: string
  error_target_node_id?: string
  // pix_payment
  expiration_minutes?: number
  pending_text?: string
  copy_button_text?: string
  paid_button_text?: string
  expired_target_node_id?: string
  // wait_payment
  polling_interval_seconds?: number
  timeout_minutes?: number
  paid_target_node_id?: string
  pending_target_node_id?: string
  // delivery
  delivery_template?: string
  support_button_text?: string
  support_target_node_id?: string
  buy_again_button_text?: string
  buy_again_target_node_id?: string
  // support
  support_type?: 'whatsapp' | 'email' | 'internal_ticket' | 'external_link'
  support_url?: string
  prefilled_message?: string
  create_ticket?: boolean
  // action
  action_type?: 'send_webhook' | 'send_email' | 'meta_pixel_event' | 'notify_admin' | 'tag_lead'
  payload?: Record<string, unknown>
  // redirect
  url?: string
  // end
  final_message?: string
  restart_button?: boolean
  [key: string]: unknown
}

export interface FlowButton {
  id: string
  label: string
  action_type: 'go_to_node' | 'open_checkout' | 'open_faq' | 'open_support' | 'external_link' | 'restart_flow'
  target_node_id?: string
  external_url?: string | null
}

export interface FlowCondition {
  variable: string
  operator: 'equals' | 'not_equals' | 'contains' | 'exists' | 'greater_than' | 'less_than'
  value: string | number | boolean
  target_node_id: string
}

export interface FlowNode {
  id: string
  user_id: string
  flow_id: string
  type: NodeType
  title: string | null
  position_x: number
  position_y: number
  config: FlowNodeConfig
  created_at: string
  updated_at: string
}

export interface FlowEdge {
  id: string
  user_id: string
  flow_id: string
  source_node_id: string
  source_handle: string | null
  target_node_id: string
  target_handle: string | null
  condition: Record<string, unknown> | null
  created_at: string
}

// ---- Public Pages ----
export type PageStatus = 'draft' | 'published' | 'archived'

export interface PublicPage {
  id: string
  user_id: string
  product_id: string | null
  flow_id: string | null
  slug: string
  public_title: string
  public_subtitle: string | null
  avatar_url: string | null
  logo_url: string | null
  theme_id: string
  primary_color: string
  secondary_color: string
  background_config: Record<string, unknown>
  bubble_style: string
  button_style: string
  show_header: boolean
  show_support_button: boolean
  show_microcopy: boolean
  microcopy_text: string | null
  show_powered_by: boolean
  custom_css: string | null
  status: PageStatus
  created_at: string
  updated_at: string
  // Relations
  product?: Product
  flow?: Flow
  theme?: Theme
}

// ---- Inventory ----
export type InventoryStatus = 'available' | 'reserved' | 'delivered' | 'disabled' | 'replaced'

export interface InventoryItem {
  id: string
  user_id: string
  product_id: string
  title: string | null
  delivery_type: DeliveryType
  access_email: string | null
  access_password: string | null
  access_url: string | null
  file_url: string | null
  license_key: string | null
  custom_content: string | null
  extra_instructions: string | null
  status: InventoryStatus
  assigned_order_id: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

// ---- Orders ----
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'delivered'
  | 'expired'
  | 'cancelled'
  | 'refunded'
  | 'paid_pending_stock'
  | 'failed'

export interface Order {
  id: string
  user_id: string
  product_id: string | null
  page_id: string | null
  flow_id: string | null
  session_id: string
  customer_name: string
  customer_email: string
  customer_whatsapp: string | null
  amount: number
  currency: string
  status: OrderStatus
  payment_provider: string | null
  gateway_payment_id: string | null
  pix_code: string | null
  pix_qr_code_url: string | null
  pix_qr_code_base64: string | null
  expires_at: string | null
  paid_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  // Relations
  product?: Product
  delivery?: Delivery
}

// ---- Deliveries ----
export interface DeliveryPayload {
  product_name?: string
  customer_name?: string
  access_email?: string
  access_password?: string
  access_url?: string
  license_key?: string
  custom_content?: string
  extra_instructions?: string
  order_id?: string
  delivery_type?: DeliveryType
  [key: string]: unknown
}

export interface Delivery {
  id: string
  user_id: string
  order_id: string
  product_id: string | null
  inventory_item_id: string | null
  delivery_payload: DeliveryPayload
  delivered_at: string
  created_at: string
}

// ---- Payment Events ----
export interface PaymentEvent {
  id: string
  user_id: string | null
  order_id: string | null
  provider: string
  event_type: string
  payload: Record<string, unknown>
  received_at: string
}

// ---- Support ----
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface SupportRequest {
  id: string
  user_id: string
  order_id: string | null
  product_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_whatsapp: string | null
  message: string
  status: SupportStatus
  created_at: string
  updated_at: string
}

// ---- Analytics ----
export type AnalyticsEventName =
  | 'PageView'
  | 'StartChat'
  | 'ClickButton'
  | 'ViewCheckout'
  | 'InitiateCheckout'
  | 'GeneratePix'
  | 'PaymentPending'
  | 'Purchase'
  | 'DeliveryCompleted'
  | 'SupportClicked'

export interface AnalyticsEvent {
  id: string
  user_id: string | null
  page_id: string | null
  product_id: string | null
  flow_id: string | null
  order_id: string | null
  session_id: string | null
  event_name: AnalyticsEventName
  event_data: Record<string, unknown>
  created_at: string
}

// ---- Admin Settings ----
export interface AdminSetting {
  id: string
  user_id: string
  key: string
  value: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- Payment ----
export interface CreatePixPaymentParams {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  customerDocument?: string
  description?: string
  webhookUrl?: string
}

export interface PixPaymentResult {
  gatewayPaymentId: string
  pixCode: string
  pixQrCodeUrl?: string
  pixQrCodeBase64?: string
  expiresAt?: Date
  status: string
}

export interface PaymentStatus {
  id: string
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  raw?: Record<string, unknown>
}

// ---- Flow Runner Session State ----
export interface FlowSessionState {
  session_id: string
  page_id: string
  product_id: string | null
  flow_id: string
  current_node_id: string | null
  visible_messages: ChatMessage[]
  variables: Record<string, unknown>
  order_id: string | null
}

export interface ChatMessage {
  id: string
  type: 'assistant' | 'user' | 'system' | 'typing' | 'buttons' | 'checkout' | 'pix' | 'delivery' | 'faq' | 'input'
  content?: string
  buttons?: FlowButton[]
  timestamp: number
  nodeType?: NodeType
  nodeId?: string
  payload?: Record<string, unknown>
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ---- Dashboard Metrics ----
export interface DashboardMetrics {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalRevenue: number
  activeProducts: number
  publishedPages: number
  availableStock: number
  deliveriesCompleted: number
}
