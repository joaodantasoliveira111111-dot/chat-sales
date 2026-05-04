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
        <div className="text-slate-500">Carregando analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Métricas de funil, engajamento e desempenho
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold">Diagnóstico Automático</h3>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-slate-500">Total de Visitas</p>
              </div>
              <p className="text-3xl font-bold">{funnelData.totalVisits.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-sm text-slate-500">Taxa de Conversão</p>
              </div>
              <p className="text-3xl font-bold">
                {funnelData.funnel.find(f => f.name === 'Purchase')?.percentage || 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <p className="text-sm text-slate-500">Total de Interações</p>
              </div>
              <p className="text-3xl font-bold">
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
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
  }

  const bgColors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
  }

  return (
    <div className={`p-4 rounded-lg border ${bgColors[alert.type]}`}>
      <div className="flex items-start gap-3">
        {icons[alert.type]}
        <div className="flex-1">
          <p className="font-semibold text-sm">{alert.title}</p>
          <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
        </div>
      </div>
    </div>
  )
}

function FunnelChart({ funnel }: { funnel: FunnelStage[] }) {
  const maxCount = Math.max(...funnel.map(f => f.count))

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold mb-6">Funil de Conversão</h3>
        <div className="space-y-4">
          {funnel.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stage.icon}</span>
                  <div>
                    <p className="font-semibold">{stage.label}</p>
                    <p className="text-sm text-slate-500">{stage.count.toLocaleString()} usuários</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{stage.percentage}%</p>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
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
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold mb-6">Taxas de Conversão</h3>
        <div className="space-y-4">
          {rates.map((rate, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-slate-500">
                  {rate.from} → {rate.to}
                </p>
                <p className="font-semibold mt-1">{rate.rate}% conversão</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${rate.dropOff > 50 ? 'text-red-500' : rate.dropOff > 30 ? 'text-yellow-500' : 'text-green-500'}`}>
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
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold mb-6">Engajamento</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Total de Interações</p>
            <p className="text-2xl font-bold mt-1">{data.totalInteractions.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">
              {data.averageInteractionsPerUser} média por usuário
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Nós Visualizados</p>
            <p className="text-2xl font-bold mt-1">{data.totalNodesViewed.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-2">
              {data.averageNodesPerUser} média por usuário
            </p>
          </div>
        </div>

        {data.topNodes.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-4">Top Nós Mais Visualizados</h4>
            <div className="space-y-2">
              {data.topNodes.slice(0, 5).map((node, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium">{node.nodeId}</p>
                  <p className="text-sm text-slate-500">{node.count} visualizações</p>
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
    <Card>
      <CardContent className="p-6">
        <h3 className="font-bold mb-6">Origem do Tráfego</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold mb-4">UTM Sources</h4>
            {data.utmSources.length > 0 ? (
              <div className="space-y-2">
                {data.utmSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm">{source.source}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500">{source.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum dado disponível</p>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">Referrers</h4>
            {data.referrers.length > 0 ? (
              <div className="space-y-2">
                {data.referrers.map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-sm">{referrer.referrer}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${referrer.percentage}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500">{referrer.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
