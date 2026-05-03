import { createAdminClient } from '@/lib/supabase/middleware'
import { decryptSecret } from './crypto'
import {
  buildCustomData,
  getClientIp,
  getCookieValue,
  normalizeAndHashUserData,
  shouldSendToMeta,
  toMetaEventName,
} from './events'

export interface MetaTrackingSettings {
  user_id: string
  pixel_id: string | null
  access_token_encrypted: string | null
  test_event_code: string | null
  is_enabled: boolean
  browser_tracking_enabled: boolean
  server_tracking_enabled: boolean
  advanced_matching_enabled: boolean
  deduplication_enabled: boolean
}

export async function getMetaSettings(userId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('meta_tracking_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data as MetaTrackingSettings | null
}

export async function sendMetaCapiEvent(input: {
  tenantId: string
  eventName: string
  eventId: string
  request?: Request
  session?: Record<string, unknown> | null
  lead?: Record<string, unknown>
  customData?: Record<string, unknown>
  eventSourceUrl?: string
  source?: 'browser' | 'server' | 'both'
}) {
  const supabase = createAdminClient()
  const settings = await getMetaSettings(input.tenantId)
  const metaEventName = toMetaEventName(input.eventName)

  if (!settings?.is_enabled || !settings.server_tracking_enabled || !settings.pixel_id || !shouldSendToMeta(input.eventName)) {
    await logTrackingEvent({
      ...input,
      metaEventName,
      status: 'skipped',
      response: { reason: 'meta_tracking_disabled_or_event_not_sendable' },
    })
    return { ok: false, skipped: true }
  }

  const accessToken = decryptSecret(settings.access_token_encrypted)
  if (!accessToken) {
    await logTrackingEvent({
      ...input,
      metaEventName,
      status: 'failed',
      error: 'Meta Access Token não configurado',
    })
    return { ok: false, error: 'missing_access_token' }
  }

  const session = input.session || {}
  const userData = normalizeAndHashUserData({
    lead: input.lead,
    session,
    request: input.request,
    advancedMatching: settings.advanced_matching_enabled,
  })
  const eventSourceUrl = input.eventSourceUrl || String(session.landing_page_url || input.request?.url || '')
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: metaEventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: buildCustomData(input.customData || {}),
      },
    ],
  }

  if (settings.test_event_code) {
    payload.test_event_code = settings.test_event_code
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION || 'v21.0'
  const url = `https://graph.facebook.com/${graphVersion}/${settings.pixel_id}/events?access_token=${encodeURIComponent(accessToken)}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await response.json().catch(() => ({}))
    const ok = response.ok && !json.error
    await logTrackingEvent({
      ...input,
      metaEventName,
      payload,
      response: json,
      status: ok ? 'sent' : 'failed',
      error: ok ? undefined : json.error?.message || `Meta API HTTP ${response.status}`,
    })
    await supabase.from('meta_tracking_settings').update({
      last_event_at: new Date().toISOString(),
      last_event_name: metaEventName,
      last_event_status: ok ? 'sent' : 'failed',
      updated_at: new Date().toISOString(),
    }).eq('user_id', input.tenantId)
    return { ok, response: json }
  } catch (error: any) {
    await logTrackingEvent({
      ...input,
      metaEventName,
      payload,
      status: 'failed',
      error: error?.message || 'Erro ao enviar para Meta CAPI',
    })
    return { ok: false, error: error?.message }
  }
}

async function logTrackingEvent(input: {
  tenantId: string
  eventName: string
  eventId: string
  metaEventName: string
  session?: Record<string, unknown> | null
  customData?: Record<string, unknown>
  payload?: Record<string, unknown>
  response?: Record<string, unknown>
  status: string
  source?: 'browser' | 'server' | 'both'
  error?: string
}) {
  const supabase = createAdminClient()
  await supabase.from('tracking_events').upsert({
    tenant_id: input.tenantId,
    session_id: String(input.session?.session_id || input.customData?.session_id || ''),
    conversation_id: String(input.session?.conversation_id || input.customData?.conversation_id || ''),
    lead_id: String(input.session?.lead_id || input.customData?.lead_id || ''),
    order_id: input.customData?.order_id || input.session?.order_id || null,
    page_id: input.customData?.page_id || input.session?.page_id || null,
    product_id: input.customData?.product_id || input.session?.product_id || null,
    flow_id: input.customData?.flow_id || input.session?.flow_id || null,
    event_name: input.eventName,
    event_id: input.eventId,
    source: input.source || 'server',
    meta_event_name: input.metaEventName,
    payload: input.payload || input.customData || {},
    response: input.response || {},
    status: input.status,
    error_message: input.error || null,
  }, { onConflict: 'event_id,source' })
}

export function buildTrackingSessionFromRequest(request: Request, body: Record<string, any>) {
  const url = new URL(body.event_source_url || request.url)
  const cookieHeader = request.headers.get('cookie')
  return {
    tenant_id: body.user_id,
    page_id: body.page_id || null,
    product_id: body.product_id || null,
    flow_id: body.flow_id || null,
    conversation_id: body.conversation_id || body.session_id || null,
    lead_id: body.lead_id || null,
    order_id: body.order_id || null,
    session_id: body.session_id,
    fbp: body.fbp || getCookieValue(cookieHeader, '_fbp') || null,
    fbc: body.fbc || getCookieValue(cookieHeader, '_fbc') || buildFbc(body.fbclid || url.searchParams.get('fbclid')),
    fbclid: body.fbclid || url.searchParams.get('fbclid') || null,
    user_agent: request.headers.get('user-agent') || body.user_agent || null,
    ip_address: getClientIp(request) || body.ip_address || null,
    landing_page_url: body.landing_page_url || body.event_source_url || request.headers.get('referer') || null,
    referrer: body.referrer || request.headers.get('referer') || null,
    utm_source: body.utm_source || url.searchParams.get('utm_source') || null,
    utm_medium: body.utm_medium || url.searchParams.get('utm_medium') || null,
    utm_campaign: body.utm_campaign || url.searchParams.get('utm_campaign') || null,
    utm_content: body.utm_content || url.searchParams.get('utm_content') || null,
    utm_term: body.utm_term || url.searchParams.get('utm_term') || null,
  }
}

function buildFbc(fbclid: unknown) {
  const value = String(fbclid || '')
  if (!value) return null
  return `fb.1.${Date.now()}.${value}`
}
