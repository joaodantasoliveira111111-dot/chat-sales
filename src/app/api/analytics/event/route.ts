import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { z } from 'zod'

const schema = z.object({
  event: z.string(),
  page_id: z.string().optional(),
  product_id: z.string().optional(),
  session_id: z.string().optional(),
  flow_id: z.string().optional(),
  order_id: z.string().optional(),
  user_id: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false })

    const supabase = createAdminClient()
    const { event, page_id, product_id, session_id, flow_id, order_id, user_id, ...rest } = parsed.data

    await supabase.from('analytics_events').insert({
      event_name: event,
      page_id: page_id || null,
      product_id: product_id || null,
      flow_id: flow_id || null,
      order_id: order_id || null,
      session_id: session_id || null,
      user_id: user_id || null,
      event_data: rest,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
