import { createAdminClient } from '@/lib/supabase/middleware'
import { AnalyticsEventName } from '@/types'

export async function trackEvent(
  eventName: AnalyticsEventName,
  data: {
    page_id?: string
    product_id?: string
    flow_id?: string
    order_id?: string
    session_id?: string
    user_id?: string
    [key: string]: unknown
  }
) {
  try {
    const supabase = createAdminClient()
    const { page_id, product_id, flow_id, order_id, session_id, user_id, ...eventData } = data

    await supabase.from('analytics_events').insert({
      user_id: user_id || null,
      page_id: page_id || null,
      product_id: product_id || null,
      flow_id: flow_id || null,
      order_id: order_id || null,
      session_id: session_id || null,
      event_name: eventName,
      event_data: eventData,
    })
  } catch (err) {
    // Analytics failures should never break the main flow
    console.error('Analytics track error:', err)
  }
}
