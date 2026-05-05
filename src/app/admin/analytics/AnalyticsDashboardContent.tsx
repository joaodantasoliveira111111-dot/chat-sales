'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Activity, TrendingUp, Users, AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react'

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

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function AnalyticsDashboardContent({ userId }: Props) {
  const [days, setDays] = useState<string | number>(30)
  const toast = useToast()

  const { data: funnelData, error: funnelError, isLoading: funnelLoading, mutate: mutateFunnel } = useSWR<FunnelData>(
    `/api/analytics/funnel?days=${days}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
  const { data: engagementData, error: engagementError, isLoading: engagementLoading, mutate: mutateEngagement } = useSWR<EngagementData>(
    `/api/analytics/engagement?days=${days}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
  const { data: trafficData, error: trafficError, isLoading: trafficLoading, mutate: mutateTraffic } = useSWR<TrafficData>(
    `/api/analytics/traffic?days=${days}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )
  const { data: diagnosticsData, error: diagnosticsError, isLoading: diagnosticsLoading, mutate: mutateDiagnostics } = useSWR<DiagnosticsData>(
    `/api/analytics/diagnostics?days=${days}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  )

  const loading = funnelLoading || engagementLoading || trafficLoading || diagnosticsLoading
  const hasError = funnelError || engagementError || trafficError || diagnosticsError

  const refreshAll = () => {
    mutateFunnel()
    mutateEngagement()
    mutateTraffic()
    mutateDiagnostics()
    toast.info('Atualizando dados...')
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.15)] rounded-xl text-center">
          <XCircle className="w-8 h-8 text-[#DC2626] mx-auto mb-3" />
          <p className="font-semibold text-[#081827]">Erro ao carregar analytics</p>
          <p className="text-sm text-[#35516B] mt-1">Algumas seções podem não estar disponíveis.</p>
          <Button variant="secondary" size="sm" onClick={refreshAll} className="mt-4" leftIcon={<RefreshCw size={14} />}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
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
        <Button variant="secondary" size="sm" onClick={refreshAll} leftIcon={<RefreshCw size={14} />}>
          Atualizar
        </Button>
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
        <div className="max-w-lg mx-auto">
          {funnel.map((stage, index) => {
            const pct = Math.max(20, (stage.count / maxCount) * 100)
            const nextPct = index < funnel.length - 1
              ? Math.max(20, (funnel[index + 1].count / maxCount) * 100)
              : pct * 0.65
            const inset = (100 - pct) / 2
            const nextInset = (100 - nextPct) / 2

            return (
              <div key={stage.name}>
                <div
                  className="relative bg-gradient-to-r from-[#0B7CFF] to-[#00C2FF] text-white transition-all duration-500"
                  style={{
                    clipPath: `polygon(${inset}% 0%, ${100 - inset}% 0%, ${100 - nextInset}% 100%, ${nextInset}% 100%)`,
                    minHeight: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div className="flex items-center justify-between w-full px-6" style={{ maxWidth: `${pct}%` }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold bg-white/20 rounded-md px-1.5 py-0.5">{index + 1}</span>
                      <span className="font-semibold text-sm truncate">{stage.label}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-sm font-extrabold">{stage.count.toLocaleString()}</span>
                      <span className="text-[10px] opacity-75 ml-1.5">{stage.percentage}%</span>
                    </div>
                  </div>
                </div>
                {index < funnel.length - 1 && (
                  <div className="text-center py-1">
                    <span className="inline-flex items-center text-[11px] font-semibold text-[#0B7CFF]">
                      ↓ {Math.round((funnel[index + 1].count / stage.count) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )
          })}
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
