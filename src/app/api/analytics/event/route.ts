import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { buildTrackingSessionFromRequest, sendMetaCapiEvent } from '@/lib/meta/capi'
import { generateMetaEventId, toMetaEventName } from '@/lib/meta/events'
import { z } from 'zod'

const schema = z.object({
  event: z.string(),
  page_id: z.string().optional(),
  product_id: z.string().optional(),
  session_id: z.string().optional(),
  flow_id: z.string().optional(),
  order_id: z.string().optional(),
  user_id: z.string().optional(),
  event_id: z.string().optional(),
  event_source_url: z.string().optional(),
  source: z.enum(['browser', 'server', 'both']).optional(),
  lead: z.record(z.string(), z.unknown()).optional(),
}).passthrough()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false })

    const supabase = await createClient()
    const admin = createAdminClient()
    const { event, page_id, product_id, session_id, flow_id, order_id, user_id, event_id, event_source_url, source, lead, ...rest } = parsed.data
    const metaEventName = toMetaEventName(event)
    const resolvedEventId = event_id || generateMetaEventId(metaEventName, {
      event,
      page_id,
      product_id,
      session_id,
      flow_id,
      order_id,
      user_id,
      ...rest,
    })

    const { error } = await supabase.from('analytics_events').insert({
      event_name: event,
      page_id: page_id || null,
      product_id: product_id || null,
      flow_id: flow_id || null,
      order_id: order_id || null,
      session_id: session_id || null,
      user_id: user_id || null,
      event_data: { ...rest, event_id: resolvedEventId, meta_event_name: metaEventName },
    })

    if (error) {
      console.error('[analytics] erro ao registrar evento', error)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    if (user_id && session_id) {
      const session = buildTrackingSessionFromRequest(request, {
        ...rest,
        user_id,
        page_id,
        product_id,
        flow_id,
        order_id,
        session_id,
        event_source_url,
      })
      await admin.from('tracking_sessions').upsert(session, { onConflict: 'tenant_id,session_id' })

      await sendMetaCapiEvent({
        tenantId: user_id,
        eventName: event,
        eventId: resolvedEventId,
        request,
        session,
        lead: lead || {
          name: rest.name || rest.customer_name,
          email: rest.email || rest.customer_email,
          phone: rest.phone || rest.whatsapp || rest.customer_whatsapp,
          external_id: rest.lead_id || session_id,
        },
        customData: {
          ...rest,
          page_id,
          product_id,
          flow_id,
          order_id,
          session_id,
          event_source_url,
        },
        eventSourceUrl: event_source_url,
        source: source || 'both',
      })
    }

    return NextResponse.json({ ok: true, event_id: resolvedEventId })
  } catch (error) {
    console.error('[analytics] erro inesperado', error)
    return NextResponse.json({ ok: false })
  }
}
