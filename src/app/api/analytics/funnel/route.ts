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

    // Get all events for the user
    let query = admin
      .from('tracking_events')
      .select('*')
      .eq('tenant_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data: events } = await query

    if (!events) {
      return NextResponse.json({
        funnel: [],
        conversionRates: [],
        totalVisits: 0,
      })
    }

    // Count unique sessions for each funnel stage
    const uniqueSessions = new Map<string, Set<string>>()

    events.forEach(event => {
      const sessionId = event.session_id || 'unknown'
      if (!uniqueSessions.has(event.event_name)) {
        uniqueSessions.set(event.event_name, new Set())
      }
      uniqueSessions.get(event.event_name)!.add(sessionId)
    })

    // Funnel stages in order
    const funnelStages = [
      { name: 'PageView', label: 'Visitas', icon: '👁️' },
      { name: 'ChatOpened', label: 'Chat Aberto', icon: '💬' },
      { name: 'FlowStarted', label: 'Fluxo Iniciado', icon: '🚀' },
      { name: 'ViewNode', label: 'Interação', icon: '👆' },
      { name: 'AddPaymentInfo', label: 'Pedido Gerado', icon: '📦' },
      { name: 'Purchase', label: 'Pagamento Aprovado', icon: '✅' },
    ]

    // Build funnel data
    const funnel = funnelStages.map(stage => {
      const sessions = uniqueSessions.get(stage.name) || new Set()
      return {
        ...stage,
        count: sessions.size,
        percentage: 0, // Will be calculated
      }
    })

    // Calculate percentages
    const totalVisits = funnel[0]?.count || 0
    funnel.forEach(stage => {
      stage.percentage = totalVisits > 0 ? Math.round((stage.count / totalVisits) * 100) : 0
    })

    // Calculate conversion rates between stages
    const conversionRates = []
    for (let i = 1; i < funnel.length; i++) {
      const current = funnel[i]
      const previous = funnel[i - 1]
      const rate = previous.count > 0 ? Math.round((current.count / previous.count) * 100) : 0
      conversionRates.push({
        from: previous.label,
        to: current.label,
        rate,
        dropOff: 100 - rate,
      })
    }

    return NextResponse.json({
      funnel,
      conversionRates,
      totalVisits,
      period: { days: period, startDate: startDate.toISOString(), endDate: endDate?.toISOString() },
    })
  } catch (error) {
    console.error('[analytics/funnel] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
