import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'

interface Alert {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  metric?: string
  value?: number
  threshold?: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const alerts: Alert[] = []

    // Check for skipped events
    const { data: skippedEvents } = await admin
      .from('tracking_events')
      .select('*')
      .eq('tenant_id', user.id)
      .eq('status', 'skipped')
      .gte('created_at', startDate.toISOString())

    if (skippedEvents && skippedEvents.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Eventos sendo ignorados',
        message: `${skippedEvents.length} eventos foram ignorados. Verifique se o tracking está configurado corretamente.`,
        metric: 'skipped_events',
        value: skippedEvents.length,
      })
    }

    // Check for failed events
    const { data: failedEvents } = await admin
      .from('tracking_events')
      .select('*')
      .eq('tenant_id', user.id)
      .eq('status', 'failed')
      .gte('created_at', startDate.toISOString())

    if (failedEvents && failedEvents.length > 0) {
      alerts.push({
        type: 'error',
        title: 'Falha no envio de eventos',
        message: `${failedEvents.length} eventos falharam ao ser enviados para Meta. Verifique suas configurações.`,
        metric: 'failed_events',
        value: failedEvents.length,
      })
    }

    // Check conversion rates
    const { data: events } = await admin
      .from('tracking_events')
      .select('*')
      .eq('tenant_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (events && events.length > 0) {
      const uniqueSessions = new Map<string, Set<string>>()
      events.forEach(event => {
        const sessionId = event.session_id || 'unknown'
        if (!uniqueSessions.has(event.event_name)) {
          uniqueSessions.set(event.event_name, new Set())
        }
        uniqueSessions.get(event.event_name)!.add(sessionId)
      })

      const pageViews = uniqueSessions.get('PageView')?.size || 0
      const purchases = uniqueSessions.get('Purchase')?.size || 0

      if (pageViews > 0) {
        const conversionRate = Math.round((purchases / pageViews) * 100)

        if (conversionRate < 1) {
          alerts.push({
            type: 'error',
            title: 'Taxa de conversão muito baixa',
            message: `Apenas ${conversionRate}% das visitas resultaram em compras. Revise seu funil.`,
            metric: 'conversion_rate',
            value: conversionRate,
            threshold: 1,
          })
        } else if (conversionRate < 3) {
          alerts.push({
            type: 'warning',
            title: 'Taxa de conversão abaixo do ideal',
            message: `${conversionRate}% das visitas resultaram em compras. Considere otimizar seu funil.`,
            metric: 'conversion_rate',
            value: conversionRate,
            threshold: 3,
          })
        } else {
          alerts.push({
            type: 'success',
            title: 'Taxa de conversão saudável',
            message: `${conversionRate}% das visitas resultaram em compras. Bom trabalho!`,
            metric: 'conversion_rate',
            value: conversionRate,
          })
        }
      }

      // Check chat open rate
      const chatOpens = uniqueSessions.get('ChatOpened')?.size || 0
      if (pageViews > 0) {
        const chatOpenRate = Math.round((chatOpens / pageViews) * 100)

        if (chatOpenRate < 50) {
          alerts.push({
            type: 'warning',
            title: 'Baixa taxa de abertura do chat',
            message: `Apenas ${chatOpenRate}% dos visitantes abriram o chat. Considere melhorar o CTA.`,
            metric: 'chat_open_rate',
            value: chatOpenRate,
            threshold: 50,
          })
        }
      }

      // Check flow completion
      const flowStarts = uniqueSessions.get('FlowStarted')?.size || 0
      if (chatOpens > 0) {
        const flowCompletionRate = Math.round((flowStarts / chatOpens) * 100)

        if (flowCompletionRate < 30) {
          alerts.push({
            type: 'warning',
            title: 'Baixa taxa de conclusão do fluxo',
            message: `Apenas ${flowCompletionRate}% dos usuários que abriram o chat iniciaram o fluxo.`,
            metric: 'flow_completion_rate',
            value: flowCompletionRate,
            threshold: 30,
          })
        }
      }
    }

    // Check if tracking is enabled
    const { data: settings } = await admin
      .from('meta_tracking_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!settings || !settings.is_enabled) {
      alerts.push({
        type: 'error',
        title: 'Tracking desativado',
        message: 'O rastreamento Meta está desativado. Ative-o para começar a coletar dados.',
        metric: 'tracking_enabled',
        value: 0,
      })
    } else if (!settings.pixel_id) {
      alerts.push({
        type: 'error',
        title: 'Pixel ID não configurado',
        message: 'Configure o Pixel ID para começar a rastrear eventos.',
        metric: 'pixel_configured',
        value: 0,
      })
    }

    // Check for recent activity
    const recentEvents = events?.filter(e => {
      const eventDate = new Date(e.created_at)
      const now = new Date()
      const hoursSince = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60)
      return hoursSince <= 24
    }) || []

    if (recentEvents.length === 0 && events && events.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Sem atividade recente',
        message: 'Nenhum evento nas últimas 24 horas. Verifique se suas páginas estão ativas.',
        metric: 'recent_activity',
        value: 0,
      })
    }

    return NextResponse.json({
      alerts,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.type === 'error').length,
      warningAlerts: alerts.filter(a => a.type === 'warning').length,
      successAlerts: alerts.filter(a => a.type === 'success').length,
    })
  } catch (error) {
    console.error('[analytics/diagnostics] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
