'use client'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: unknown
  }
}

export interface BrowserMetaSettings {
  is_enabled?: boolean
  pixel_id?: string | null
  browser_tracking_enabled?: boolean
  advanced_matching_enabled?: boolean
  deduplication_enabled?: boolean
}

let loadedPixelId: string | null = null

export function loadMetaPixel(settings: BrowserMetaSettings, advancedData?: Record<string, unknown>) {
  if (!settings.is_enabled || !settings.browser_tracking_enabled || !settings.pixel_id) return false
  if (typeof window === 'undefined') return false

  if (!window.fbq) {
    const fbq = function (...args: any[]) {
      ;(fbq as any).callMethod ? (fbq as any).callMethod.apply(fbq, args) : (fbq as any).queue.push(args)
    } as any
    if (!window._fbq) window._fbq = fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    window.fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  if (loadedPixelId !== settings.pixel_id) {
    window.fbq?.('init', settings.pixel_id, settings.advanced_matching_enabled ? cleanAdvancedData(advancedData) : undefined)
    loadedPixelId = settings.pixel_id
  }
  return true
}

export function trackMetaBrowserEvent(eventName: string, context: Record<string, unknown>, customData: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.fbq) return ''
  const metaEventName = toMetaEventName(eventName)
  const eventId = String(context.event_id || generateMetaEventId(metaEventName, context))
  window.fbq?.('track', metaEventName, cleanCustomData(customData), { eventID: eventId })
  return eventId
}

function toMetaEventName(eventName: string) {
  const map: Record<string, string> = {
    PixGenerated: 'AddPaymentInfo',
    PaymentApproved: 'Purchase',
    SupportClicked: 'Contact',
    CaptureCompleted: 'Lead',
  }
  return map[eventName] || eventName
}

function generateMetaEventId(eventName: string, context: Record<string, unknown>) {
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
  return `${eventName}:${sessionId}:${Date.now()}`
}

export function getMetaBrowserContext() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get('fbclid') || ''
  const fbc = readCookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : '')
  return {
    event_source_url: window.location.href,
    landing_page_url: window.location.href,
    referrer: document.referrer || '',
    fbclid,
    fbp: readCookie('_fbp'),
    fbc,
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  }
}

function readCookie(name: string) {
  return document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || ''
}

function cleanCustomData(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function cleanAdvancedData(data?: Record<string, unknown>) {
  if (!data) return undefined
  return cleanCustomData({
    em: data.email,
    ph: data.phone,
    fn: data.firstName,
    ln: data.lastName,
    external_id: data.external_id,
  })
}
