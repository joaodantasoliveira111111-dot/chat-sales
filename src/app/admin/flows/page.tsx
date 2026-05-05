import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { FlowsContent, FlowFunnel } from './FlowsContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FlowsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: flows, error: flowsError } = await supabase
    .from('flows')
    .select('*, product:products(name)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  const { data: analytics, error: analyticsError } = await supabase
    .from('analytics_events')
    .select('flow_id, session_id, event_name, event_data')
    .eq('user_id', user.id)
    .not('flow_id', 'is', null)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (flowsError) console.error('[flows page] erro ao carregar fluxos', flowsError)
  if (productsError) console.error('[flows page] erro ao carregar produtos', productsError)
  if (analyticsError) console.error('[flows page] erro ao carregar analytics', analyticsError)

  return (
    <AdminLayout>
      <FlowsContent flows={flows || []} products={products || []} userId={user.id} funnelByFlow={buildFunnelByFlow(analytics || [])} />
    </AdminLayout>
  )
}

function buildFunnelByFlow(events: { flow_id: string | null; session_id: string | null; event_name: string; event_data: Record<string, unknown> | null }[]) {
  const map: Record<string, FlowFunnel> = {}
  const seen: Record<string, Set<string>> = {}

  const ensure = (flowId: string) => {
    if (!map[flowId]) {
      map[flowId] = { entered: 0, replied: 0, priceViewed: 0, pixGenerated: 0, paid: 0, delivered: 0 }
      seen[flowId] = new Set()
    }
    return map[flowId]
  }

  for (const event of events) {
    if (!event.flow_id) continue
    const funnel = ensure(event.flow_id)
    const sessionId = String(event.session_id || event.event_data?.session_id || '')
    const key = sessionId ? `${event.event_name}:${sessionId}` : ''
    if (key && seen[event.flow_id].has(key)) continue
    if (key) seen[event.flow_id].add(key)

    if (event.event_name === 'PageView' || event.event_name === 'ChatOpened' || event.event_name === 'FlowStarted') funnel.entered += 1
    if (event.event_name === 'QuickReplyClicked' || event.event_name === 'Lead' || event.event_name === 'PlanSelected') funnel.replied += 1
    if (event.event_name === 'ViewContent' || event.event_name === 'ViewCheckout' || event.event_name === 'InitiateCheckout') funnel.priceViewed += 1
    if (event.event_name === 'AddPaymentInfo' || event.event_name === 'PixCopied') funnel.pixGenerated += 1
    if (event.event_name === 'Purchase') funnel.paid += 1
    if (event.event_name === 'DeliveryCompleted') funnel.delivered += 1
  }

  return map
}
