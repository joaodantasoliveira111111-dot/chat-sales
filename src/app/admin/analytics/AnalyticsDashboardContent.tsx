'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Activity, TrendingUp, Users, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface FunnelStage {
  name: string
  label: string
  icon: string
  count: number
  percentage: number
}

interface ConversionRate {
  from: string
  to: string
  rate: number
  dropOff: number
}

interface FunnelData {
  funnel: FunnelStage[]
  conversionRates: ConversionRate[]
  totalVisits: number
  period: { days: number; startDate: string }
}

interface EngagementData {
  totalInteractions: number
  averageInteractionsPerUser: number
  totalNodesViewed: number
  averageNodesPerUser: number
  topNodes: Array<{ nodeId: string; count: number }>
  interactionTrend: Array<{ date: string; count: number }>
  uniqueUsers: number
}

interface TrafficData {
  utmSources: Array<{ source: string; count: number; percentage: number }>
  referrers: Array<{ referrer: string; count: number; percentage: number }>
  totalSessions: number
}

interface Alert {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  metric?: string
  value?: number
  threshold?: number
}

interface DiagnosticsData {
  alerts: Alert[]
  totalAlerts: number
  criticalAlerts: number
  warningAlerts: number
  successAlerts: number
}

interface Props {
  userId: string
}

export function AnalyticsDashboardContent({ userId }: Props) {
  const [days, setDays] = useState<string | number>(30)
  const [loading, setLoading] = useState(true)
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null)
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsData | null>(null)

  useEffect(() => {
    loadData()
  }, [days, userId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [funnelRes, engagementRes, trafficRes, diagnosticsRes] = await Promise.all([
        fetch(`/api/analytics/funnel?days=${days}`),
        fetch(`/api/analytics/engagement?days=${days}`),
        fetch(`/api/analytics/traffic?days=${days}`),
        fetch(`/api/analytics/diagnostics?days=${days}`),
      ])

      const [funnel, engagement, traffic, diagnostics] = await Promise.all([
        funnelRes.json(),
        engagementRes.json(),
        trafficRes.json(),
        diagnosticsRes.json(),
      ])

      setFunnelData(funnel)
      setEngagementData(engagement)
      setTrafficData(traffic)
      setDiagnosticsData(diagnostics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#71869B]">Carregando analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
      <h1 className="text-2xl font-bold text-[#081827]">Analytics</h1>
      <p className="text-sm text-[#71869B] mt-1">
        Metricas de funil, engajamento e desempenho
      </p>
        </div>
        <div className="flex gap-2">
          {['hoje', 'ontem', 7, 30, 90].map(d => (
            <Button
              key={d}
              variant={days === d ? 'primary' : 'secondary'}
              onClick={() => setDays(d)}
            >
              {typeof d === 'number' ? `${d} dias` : d}
            </Button>
          ))}
        </div>
      </div>

      {/* Diagnostics Alerts */}
      {diagnosticsData && diagnosticsData.alerts.length > 0 && (
    <Card variant="neu-soft">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[rgba(11,124,255,0.08)] flex items-center justify-center text-[#0B7CFF]">
            <Activity size={16} />
          </div>
          <h3 className="font-bold text-[#081827]">Diagnostico Automatico</h3>
            </div>
            <div className="space-y-3">
              {diagnosticsData.alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

  {/* Funnel Overview */}
  {funnelData && (
    <div className="grid gap-6 md:grid-cols-3">
      <Card variant="metric" accentColor="linear-gradient(90deg, #0B7CFF, #00C2FF)">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(11,124,255,0.1)] flex items-center justify-center text-[#0B7CFF]">
              <Users size={16} />
            </div>
            <p className="text-xs font-semibold text-[#35516B] uppercase tracking-wider">Total de Visitas</p>
          </div>
          <p className="text-[1.75rem] font-extrabold text-[#081827] tracking-tight leading-none">{funnelData.totalVisits.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card variant="metric" accentColor="linear-gradient(90deg, #16A34A, #22C55E)">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(22,163,74,0.1)] flex items-center justify-center text-[#16A34A]">
              <TrendingUp size={16} />
            </div>
            <p className="text-xs font-semibold text-[#35516B] uppercase tracking-wider">Taxa de Conversao</p>
          </div>
          <p className="text-[1.75rem] font-extrabold text-[#081827] tracking-tight leading-none">
            {funnelData.funnel.find(f => f.name === 'Purchase')?.percentage || 0}%
          </p>
        </CardContent>
      </Card>
      <Card variant="metric" accentColor="linear-gradient(90deg, #6D5DF6, #8B5CF6)">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[rgba(109,93,246,0.1)] flex items-center justify-center text-[#6D5DF6]">
              <Activity size={16} />
            </div>
            <p className="text-xs font-semibold text-[#35516B] uppercase tracking-wider">Total de Interacoes</p>
          </div>
          <p className="text-[1.75rem] font-extrabold text-[#081827] tracking-tight leading-none">
            {engagementData?.totalInteractions.toLocaleString() || 0}
          </p>
        </CardContent>
      </Card>
    </div>
  )}

      {/* Funnel Visualization */}
      {funnelData && <FunnelChart funnel={funnelData.funnel} />}

      {/* Conversion Rates */}
      {funnelData && funnelData.conversionRates.length > 0 && (
        <ConversionRatesCard rates={funnelData.conversionRates} />
      )}

      {/* Engagement Metrics */}
      {engagementData && <EngagementMetrics data={engagementData} />}

      {/* Traffic Sources */}
      {trafficData && <TrafficSourcesCard data={trafficData} />}
    </div>
  )
}

function AlertCard({ alert }: { alert: Alert }) {
  const icons = {
  error: <XCircle className="w-5 h-5 text-[#DC2626]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#CA8A04]" />,
  info: <Info className="w-5 h-5 text-[#0B7CFF]" />,
  success: <CheckCircle className="w-5 h-5 text-[#16A34A]" />,
  }

  const bgColors = {
    error: 'bg-[rgba(220,38,38,0.06)] border-[rgba(220,38,38,0.15)]',
    warning: 'bg-[rgba(249,115,22,0.06)] border-[rgba(249,115,22,0.15)]',
    info: 'bg-[rgba(11,124,255,0.06)] border-[rgba(11,124,255,0.15)]',
    success: 'bg-[rgba(22,163,74,0.06)] border-[rgba(22,163,74,0.15)]',
  }

  return (
    <div className={`p-4 rounded-xl border ${bgColors[alert.type]}`}>
      <div className="flex items-start gap-3">
        {icons[alert.type]}
        <div className="flex-1">
          <p className="font-semibold text-sm text-[#081827]">{alert.title}</p>
          <p className="text-sm text-[#35516B] mt-1">{alert.message}</p>
        </div>
      </div>
    </div>
  )
}

function FunnelChart({ funnel }: { funnel: FunnelStage[] }) {
  const maxCount = Math.max(...funnel.map(f => f.count))

  return (
    <Card variant="neu">
      <CardContent className="p-6">
        <h3 className="font-bold text-[#081827] mb-6">Funil de Conversao</h3>
        <div className="space-y-4">
          {funnel.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[rgba(11,124,255,0.08)] flex items-center justify-center text-[#0B7CFF] text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#081827]">{stage.label}</p>
                    <p className="text-sm text-[#71869B]">{stage.count.toLocaleString()} usuarios</p>
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#081827]">{stage.percentage}%</p>
              </div>
              <div className="h-3 bg-[#EAF1F8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B7CFF] to-[#00C2FF] rounded-full transition-all duration-500"
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ConversionRatesCard({ rates }: { rates: ConversionRate[] }) {
  return (
    <Card variant="neu">
      <CardContent className="p-6">
        <h3 className="font-bold text-[#081827] mb-6">Taxas de Conversao</h3>
        <div className="space-y-4">
          {rates.map((rate, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-[#F3F7FB] rounded-xl">
              <div className="flex-1">
                <p className="text-sm text-[#71869B]">
                  {rate.from} &gt; {rate.to}
                </p>
                <p className="font-semibold text-[#081827] mt-1">{rate.rate}% conversao</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${rate.dropOff > 50 ? 'text-[#DC2626]' : rate.dropOff > 30 ? 'text-[#F97316]' : 'text-[#16A34A]'}`}>
                  {rate.dropOff}% abandono
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function EngagementMetrics({ data }: { data: EngagementData }) {
  return (
    <Card variant="neu">
      <CardContent className="p-6">
        <h3 className="font-bold text-[#081827] mb-6">Engajamento</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-[#F3F7FB] rounded-xl">
            <p className="text-sm text-[#71869B]">Total de Interacoes</p>
            <p className="text-2xl font-extrabold text-[#081827] mt-1">{data.totalInteractions.toLocaleString()}</p>
            <p className="text-sm text-[#71869B] mt-2">
              {data.averageInteractionsPerUser} media por usuario
            </p>
          </div>
          <div className="p-4 bg-[#F3F7FB] rounded-xl">
            <p className="text-sm text-[#71869B]">Nos Visualizados</p>
            <p className="text-2xl font-extrabold text-[#081827] mt-1">{data.totalNodesViewed.toLocaleString()}</p>
            <p className="text-sm text-[#71869B] mt-2">
              {data.averageNodesPerUser} media por usuario
            </p>
          </div>
        </div>

        {data.topNodes.length > 0 && (
          <div className="mt-6">
        <h4 className="font-semibold text-[#081827] mb-4">Top Nos Mais Visualizados</h4>
        <div className="space-y-2">
          {data.topNodes.slice(0, 5).map((node, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#F3F7FB] rounded-xl">
              <p className="text-sm font-medium text-[#081827]">{node.nodeId}</p>
              <p className="text-sm text-[#71869B]">{node.count} visualizacoes</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrafficSourcesCard({ data }: { data: TrafficData }) {
  return (
    <Card variant="neu">
      <CardContent className="p-6">
        <h3 className="font-bold text-[#081827] mb-6">Origem do Trafego</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-[#081827] mb-4">UTM Sources</h4>
            {data.utmSources.length > 0 ? (
              <div className="space-y-2">
                {data.utmSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-[#081827]">{source.source}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B7CFF] rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#71869B]">{source.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#71869B]">Nenhum dado disponível</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-[#081827] mb-4">Referrers</h4>
            {data.referrers.length > 0 ? (
              <div className="space-y-2">
                {data.referrers.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                <p className="text-sm text-[#081827]">{referrer.referrer}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B7CFF] rounded-full"
                      style={{ width: `${referrer.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-[#71869B]">{referrer.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#71869B]">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
