import { createClient } from '@supabase/supabase-js'
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!supabaseUrl || !anonKey) {
      console.error('Analytics track error: Supabase public env is missing')
      return
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
    })
    const { page_id, product_id, flow_id, order_id, session_id, user_id, ...eventData } = data

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user_id || null,
      page_id: page_id || null,
      product_id: product_id || null,
      flow_id: flow_id || null,
      order_id: order_id || null,
      session_id: session_id || null,
      event_name: eventName,
      event_data: eventData,
    })
    if (error) throw error
  } catch (err) {
    // Analytics failures should never break the main flow
    console.error('Analytics track error:', err)
  }
}
