import crypto from 'crypto'
import { formatCurrency } from '@/lib/utils'

export const STANDARD_META_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'Lead',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'CompleteRegistration',
  'Contact',
])

export function toMetaEventName(eventName: string) {
  const map: Record<string, string> = {
    PixGenerated: 'AddPaymentInfo',
    PaymentApproved: 'Purchase',
    SupportClicked: 'Contact',
    CaptureCompleted: 'Lead',
  }
  return map[eventName] || eventName
}

export function shouldSendToMeta(eventName: string) {
  const metaName = toMetaEventName(eventName)
  return STANDARD_META_EVENTS.has(metaName) || eventName.startsWith('Chat') || eventName.startsWith('Flow') || eventName.endsWith('Clicked') || eventName.endsWith('Completed')
}

export function generateMetaEventId(eventName: string, context: Record<string, unknown>) {
  const sessionId = String(context.session_id || context.conversation_id || 'session')
  const orderId = context.order_id ? String(context.order_id) : ''
  const productId = context.product_id ? String(context.product_id) : ''
  const leadId = context.lead_id ? String(context.lead_id) : ''

  if (eventName === 'Purchase' || eventName === 'PaymentApproved') return `Purchase:${orderId || sessionId}`
  if (eventName === 'AddPaymentInfo' || eventName === 'PixGenerated') return `AddPaymentInfo:${orderId || sessionId}`
  if (eventName === 'InitiateCheckout') return `InitiateCheckout:${orderId || sessionId}`
  if (eventName === 'Lead' || eventName === 'CaptureCompleted') return `Lead:${leadId || sessionId}`
  if (eventName === 'ViewContent') return `ViewContent:${sessionId}:${productId || 'product'}`
  if (eventName === 'DeliveryCompleted') return `DeliveryCompleted:${orderId || sessionId}`
  if (eventName === 'PageView') return `PageView:${sessionId}`
  return `${eventName}:${sessionId}:${crypto.createHash('sha1').update(JSON.stringify(context)).digest('hex').slice(0, 10)}`
}

export function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function normalizePhone(value: unknown) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('55')) return digits
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`
  return digits
}

export function splitName(value: unknown) {
  const parts = String(value || '').trim().toLowerCase().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
  }
}

export function normalizeAndHashUserData(input: {
  lead?: Record<string, unknown>
  session?: Record<string, unknown>
  request?: Request
  advancedMatching?: boolean
}) {
  const lead = input.lead || {}
  const session = input.session || {}
  const headers = input.request?.headers
  const email = normalizeEmail(lead.email || lead.customer_email || lead['lead.email'])
  const phone = normalizePhone(lead.phone || lead.whatsapp || lead.customer_whatsapp || lead['lead.phone'])
  const { firstName, lastName } = splitName(lead.name || lead.customer_name || lead['lead.name'])
  const externalId = String(lead.external_id || lead.id || session.lead_id || session.session_id || '').trim()

  const userData: Record<string, unknown> = {
    fbp: session.fbp || undefined,
    fbc: session.fbc || undefined,
    client_ip_address: session.ip_address || getClientIp(input.request) || undefined,
    client_user_agent: session.user_agent || headers?.get('user-agent') || undefined,
  }

  if (input.advancedMatching !== false) {
    if (email) userData.em = [sha256(email)]
    if (phone) userData.ph = [sha256(phone)]
    if (firstName) userData.fn = [sha256(firstName)]
    if (lastName) userData.ln = [sha256(lastName)]
    if (externalId) userData.external_id = [sha256(externalId)]
    if (lead.city || lead['lead.city']) userData.ct = [sha256(String(lead.city || lead['lead.city']).trim().toLowerCase())]
    if (lead.state) userData.st = [sha256(String(lead.state).trim().toLowerCase())]
    if (lead.zip) userData.zp = [sha256(String(lead.zip).trim().toLowerCase())]
    if (lead.country) userData.country = [sha256(String(lead.country).trim().toLowerCase())]
  }

  return Object.fromEntries(Object.entries(userData).filter(([, value]) => value !== undefined && value !== ''))
}

export function getClientIp(request?: Request) {
  if (!request) return ''
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip') || headers.get('cf-connecting-ip') || ''
}

export function buildCustomData(input: Record<string, unknown>) {
  const value = Number(input.value || input.amount || input.order_amount || 0)
  const productId = input.product_id ? String(input.product_id) : undefined
  return {
    content_ids: input.content_ids || (productId ? [productId] : undefined),
    content_name: input.content_name || input.product_name || undefined,
    content_type: input.content_type || 'product',
    value: Number.isFinite(value) && value > 0 ? value : undefined,
    currency: input.currency || 'BRL',
    order_id: input.order_id || undefined,
    product_id: input.product_id || undefined,
    page_id: input.page_id || undefined,
    flow_id: input.flow_id || undefined,
    plan_id: input.plan_id || undefined,
    payment_method: input.payment_method || undefined,
    delivery_type: input.delivery_type || undefined,
  }
}

export function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return ''
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || ''
}

export function formatMetaValue(value: unknown) {
  return typeof value === 'number' ? formatCurrency(value) : String(value || '')
}
