import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const url = new URL(request.url)
    const period = url.searchParams.get('days') || '30'
    let startDate: Date
    let endDate: Date | undefined

    if (period === 'hoje') {
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'ontem') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const days = parseInt(period)
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // Get all events
    let query = admin
      .from('tracking_events')
      .select('*')
      .eq('tenant_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data: events } = await query

    if (!events) {
      return NextResponse.json({
        totalInteractions: 0,
        averageInteractionsPerUser: 0,
        totalNodesViewed: 0,
        averageNodesPerUser: 0,
        topNodes: [],
        interactionTrend: [],
      })
    }

    // Calculate total interactions
    const totalInteractions = events.length

    // Calculate unique users
    const uniqueUsers = new Set(events.map(e => e.session_id || e.lead_id || 'unknown'))
    const averageInteractionsPerUser = uniqueUsers.size > 0
      ? Math.round(totalInteractions / uniqueUsers.size)
      : 0

    // Calculate nodes viewed
    const viewNodeEvents = events.filter(e => e.event_name === 'ViewNode')
    const totalNodesViewed = viewNodeEvents.length
    const averageNodesPerUser = uniqueUsers.size > 0
      ? Math.round(totalNodesViewed / uniqueUsers.size)
      : 0

    // Find top nodes
    const nodeCounts = new Map<string, number>()
    viewNodeEvents.forEach(event => {
      const nodeId = event.payload?.node_id as string || 'unknown'
      nodeCounts.set(nodeId, (nodeCounts.get(nodeId) || 0) + 1)
    })

    const topNodes = Array.from(nodeCounts.entries())
      .map(([nodeId, count]) => ({ nodeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate interaction trend (by day)
    const trendByDay = new Map<string, number>()
    events.forEach(event => {
      const day = new Date(event.created_at).toISOString().split('T')[0]
      trendByDay.set(day, (trendByDay.get(day) || 0) + 1)
    })

    const interactionTrend = Array.from(trendByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalInteractions,
      averageInteractionsPerUser,
      totalNodesViewed,
      averageNodesPerUser,
      topNodes,
      interactionTrend,
      uniqueUsers: uniqueUsers.size,
    })
  } catch (error) {
    console.error('[analytics/engagement] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
