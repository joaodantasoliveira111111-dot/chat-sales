'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ShoppingCart,
  CheckCircle,
  Clock,
  Package,
  Globe,
  Archive,
  Truck,
  DollarSign,
  Zap,
  ArrowUpRight,
  Target,
  Activity,
  TrendingUp,
  AlertTriangle,
  Eye,
  Radio,
  Server,
  Shield,
  BarChart3,
  XCircle,
  HeadphonesIcon,
  CreditCard,
  ArrowRight,
  Sun,
  Moon,
  CloudSun,
  Plus,
  Rocket,
} from 'lucide-react'

interface DashboardMetrics {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  expiredOrders: number
  activeProducts: number
  publishedPages: number
  availableStock: number
  lowStock: number
  deliveries: number
  totalRevenue: number
  avgTicket: number
  openSupport: number
}

interface Checklist {
  hasProduct: boolean
  hasPage: boolean
  hasFlow: boolean
  hasInventory: boolean
  hasPayment: boolean
}

interface TrackingHealth {
  pixelConnected: boolean
  capiConnected: boolean
  browserTracking: boolean
  serverTracking: boolean
}

interface RecentOrder {
  id: string
  customer_name: string
  customer_email: string
  amount: number
  status: string
  created_at: string
  product?: { name: string } | null
}

interface DashboardContentProps {
  metrics: DashboardMetrics
  checklist: Checklist
  recentOrders: RecentOrder[]
  trackingHealth: TrackingHealth
}

const checklistItems = [
  { key: 'hasProduct', label: 'Produto criado', href: '/admin/products', desc: 'Defina oferta, preco e detalhes.', icon: Package },
  { key: 'hasPage', label: 'Pagina publicada', href: '/admin/pages', desc: 'Prepare a experiencia de venda.', icon: Globe },
  { key: 'hasFlow', label: 'Fluxo configurado', href: '/admin/flows', desc: 'Monte a conversa automatizada.', icon: Zap },
  { key: 'hasInventory', label: 'Entrega pronta', href: '/admin/inventory', desc: 'Cadastre os entregaveis digitais.', icon: Archive },
  { key: 'hasPayment', label: 'Pagamento ativo', href: '/admin/settings/payments', desc: 'Conecte seu gateway Pix.', icon: DollarSign },
] as const

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  paid: 'success',
  delivered: 'success',
  pending: 'warning',
  expired: 'danger',
  cancelled: 'danger',
  paid_pending_stock: 'danger',
}

const statusLabelMap: Record<string, string> = {
  paid: 'Pago',
  delivered: 'Entregue',
  pending: 'Pendente',
  expired: 'Expirado',
  cancelled: 'Cancelado',
  paid_pending_stock: 'Sem estoque',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Bom dia', icon: Sun, color: '#F59E0B' }
  if (hour < 18) return { text: 'Boa tarde', icon: CloudSun, color: '#F97316' }
  return { text: 'Boa noite', icon: Moon, color: '#6D5DF6' }
}

function getAlerts(metrics: DashboardMetrics, trackingHealth: TrackingHealth) {
  const alerts: { type: 'warning' | 'danger' | 'info'; icon: React.ReactNode; title: string; desc: string; href: string }[] = []

  if (metrics.availableStock <= 3 && metrics.activeProducts > 0) {
    alerts.push({
      type: 'danger',
      icon: <AlertTriangle size={16} />,
      title: 'Estoque critico',
      desc: `Apenas ${metrics.availableStock} item(ns) disponivel(is). Reposicao urgente.`,
      href: '/admin/inventory',
    })
  }

  if (metrics.pendingOrders > 5) {
    alerts.push({
      type: 'warning',
      icon: <Clock size={16} />,
      title: 'Pedidos pendentes acumulados',
      desc: `${metrics.pendingOrders} pedidos aguardando pagamento.`,
      href: '/admin/orders',
    })
  }

  if (metrics.expiredOrders > 0) {
    alerts.push({
      type: 'warning',
      icon: <XCircle size={16} />,
      title: 'Pedidos expirados',
      desc: `${metrics.expiredOrders} pedido(s) expirado(s) sem pagamento.`,
      href: '/admin/orders',
    })
  }

  if (metrics.openSupport > 0) {
    alerts.push({
      type: 'warning',
      icon: <HeadphonesIcon size={16} />,
      title: 'Suporte pendente',
      desc: `${metrics.openSupport} solicitacao(oes) aberta(s).`,
      href: '/admin/support',
    })
  }

  if (!trackingHealth.pixelConnected && !trackingHealth.capiConnected) {
    alerts.push({
      type: 'info',
      icon: <Radio size={16} />,
      title: 'Meta Pixel nao configurado',
      desc: 'Ative o rastreamento para otimizar seus anuncios.',
      href: '/admin/settings/tracking',
    })
  }

  return alerts
}

function DonutChart({ paid, pending, expired, total }: { paid: number; pending: number; expired: number; total: number }) {
  if (total === 0) return null

  const segments = [
    { value: paid, color: '#16A34A', label: 'Pagos' },
    { value: pending, color: '#F97316', label: 'Pendentes' },
    { value: expired, color: '#DC2626', label: 'Expirados' },
  ].filter(s => s.value > 0)

  if (segments.length === 0) return null

  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[100px] h-[100px] flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => {
            const pct = seg.value / total
            const dash = pct * circumference
            const gap = circumference - dash
            const currentOffset = offset
            offset += dash
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-[#081827]">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
            <span className="text-xs text-[#35516B]">{seg.label}</span>
            <span className="text-xs font-bold text-[#081827] ml-auto">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardContent({ metrics, checklist, recentOrders, trackingHealth }: DashboardContentProps) {
  const greeting = useMemo(() => getGreeting(), [])
  const GreetingIcon = greeting.icon
  const checklistProgress = Object.values(checklist).filter(Boolean).length
  const checklistTotal = Object.keys(checklist).length
  const progressPercent = Math.round((checklistProgress / checklistTotal) * 100)
  const isOnboarding = checklistProgress < checklistTotal
  const conversionRate = metrics.totalOrders > 0 ? Math.round((metrics.paidOrders / metrics.totalOrders) * 100) : 0
  const alerts = getAlerts(metrics, trackingHealth)
  const funnelStages = [
    { label: 'Pedidos', count: metrics.totalOrders, icon: ShoppingCart, color: '#0B7CFF' },
    { label: 'Pagos', count: metrics.paidOrders, icon: CheckCircle, color: '#16A34A' },
    { label: 'Entregues', count: metrics.deliveries, icon: Truck, color: '#00C2FF' },
  ]
  const funnelMax = Math.max(metrics.totalOrders, 1)
  const trackingScore = [trackingHealth.pixelConnected, trackingHealth.capiConnected, trackingHealth.browserTracking, trackingHealth.serverTracking].filter(Boolean).length
  const hasOrders = metrics.totalOrders > 0

  return (
    <div className="space-y-6">
      {/* Hero with dynamic greeting */}
      <Card variant="neu" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B7CFF]/[0.04] via-transparent to-[#00C2FF]/[0.04] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-[#0B7CFF]/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <CardContent className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${greeting.color}14` }}>
                  <GreetingIcon size={16} style={{ color: greeting.color }} />
                </div>
                <span className="text-sm font-bold text-[#71869B]">
                  {greeting.text}
                </span>
                <div className="w-1 h-1 rounded-full bg-[#B0C4D8]" />
                <span className="text-sm font-bold text-[#0B7CFF] uppercase tracking-wider">
                  Centro de operacoes
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#081827] tracking-tight mb-2 leading-tight">
                {hasOrders ? 'Venda, entregue e acompanhe.' : 'Comece sua primeira venda.'}
              </h2>
              <p className="text-sm text-[#35516B] leading-relaxed max-w-lg">
                {hasOrders
                  ? 'Visao clara do funil conversacional, entregas digitais e pontos que precisam de atencao.'
                  : 'Complete os passos abaixo para configurar sua operacao e receber o primeiro pedido.'}
              </p>
              {!hasOrders && isOnboarding && (
                <Link
                  href={checklistItems.find(item => !checklist[item.key as keyof Checklist])?.href || '/admin/products'}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#0B7CFF] text-white text-sm font-bold hover:bg-[#0B7CFF]/90 transition-colors shadow-[0_4px_14px_rgba(11,124,255,0.25)]"
                >
                  <Rocket size={16} />
                  Comecar configuracao
                </Link>
              )}
            </div>

            <div className="lg:min-w-[260px] bg-white/90 backdrop-blur-sm rounded-[18px] p-5 border border-[rgba(8,24,39,0.06)] shadow-[6px_6px_16px_rgba(8,24,39,0.04),-4px_-4px_12px_rgba(255,255,255,0.7)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#35516B] uppercase tracking-wider">Conversao</span>
                <Badge variant={conversionRate >= 50 ? 'success' : 'info'} size="sm">
                  {conversionRate >= 50 ? 'Acima da media' : 'Em analise'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-extrabold text-[#081827] tracking-tight">{conversionRate}%</span>
                {conversionRate > 0 && (
                  <TrendingUp size={18} className="text-[#16A34A]" />
                )}
              </div>
              <p className="text-xs text-[#71869B]">
                {metrics.paidOrders} pagos de {metrics.totalOrders} pedido(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alerts.map((alert, i) => {
            const bgMap = { danger: 'bg-[rgba(220,38,38,0.06)] border-[rgba(220,38,38,0.15)]', warning: 'bg-[rgba(249,115,22,0.06)] border-[rgba(249,115,22,0.15)]', info: 'bg-[rgba(11,124,255,0.06)] border-[rgba(11,124,255,0.15)]' }
            const colorMap = { danger: 'text-[#DC2626]', warning: 'text-[#F97316]', info: 'text-[#0B7CFF]' }
            return (
              <Link
                key={i}
                href={alert.href}
                className={`group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${bgMap[alert.type]}`}
              >
                <div className={`mt-0.5 ${colorMap[alert.type]}`}>{alert.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${colorMap[alert.type]}`}>{alert.title}</p>
                  <p className="text-xs text-[#35516B] mt-0.5">{alert.desc}</p>
                </div>
                <ArrowUpRight size={14} className="text-[#71869B] group-hover:text-[#0B7CFF] transition-colors mt-0.5" />
              </Link>
            )
          })}
        </div>
      )}

      {/* Onboarding */}
      {isOnboarding && (
        <Card variant="neu" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-purple-500/[0.03] pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-[rgba(109,93,246,0.1)] flex items-center justify-center">
                    <Target size={14} className="text-[#6D5DF6]" />
                  </div>
                  <span className="text-xs font-bold text-[#6D5DF6] uppercase tracking-wider">Progresso inicial</span>
                </div>
                <CardTitle className="text-xl mb-1">Configure sua primeira operacao</CardTitle>
                <p className="text-sm text-[#35516B]">Complete os passos essenciais para deixar a venda pronta.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-[#081827] tracking-tight">{progressPercent}%</div>
                <div className="text-xs text-[#71869B]">{checklistProgress}/{checklistTotal} etapas</div>
              </div>
            </div>
            <div className="mt-4 h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-[rgba(8,24,39,0.06)] -translate-y-1/2 z-0" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative z-10">
                {checklistItems.map((item, index) => {
                  const done = checklist[item.key as keyof Checklist]
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${done ? 'bg-[rgba(22,163,74,0.04)] border-[rgba(22,163,74,0.2)]' : 'bg-white border-[rgba(8,24,39,0.08)] hover:border-[rgba(109,93,246,0.3)] hover:shadow-md'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${done ? 'bg-[rgba(22,163,74,0.1)] text-[#16A34A] scale-110' : 'bg-[#F3F7FB] text-[#35516B]'}`}>
                          {done ? <CheckCircle size={18} /> : <span className="text-sm font-bold">{index + 1}</span>}
                        </div>
                        <item.icon size={18} className={done ? 'text-[#16A34A]' : 'text-[#71869B]'} />
                      </div>
                      <h3 className="font-bold text-sm text-[#081827] mb-0.5">{item.label}</h3>
                      <p className="text-xs text-[#35516B] leading-snug">{item.desc}</p>
                      {done && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#16A34A] flex items-center justify-center shadow-sm">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          accent="linear-gradient(90deg, #0B7CFF, #00C2FF)"
          iconBg="bg-[rgba(11,124,255,0.1)]"
          iconColor="text-[#0B7CFF]"
          title="Faturamento"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Receita aprovada"
          sparkData={[metrics.paidOrders, metrics.deliveries, metrics.totalOrders]}
          sparkColor="#0B7CFF"
        />
        <MetricCard
          icon={CheckCircle}
          accent="linear-gradient(90deg, #16A34A, #22C55E)"
          iconBg="bg-[rgba(22,163,74,0.1)]"
          iconColor="text-[#16A34A]"
          title="Pedidos pagos"
          value={String(metrics.paidOrders)}
          subtitle={`${metrics.totalOrders} total`}
          sparkData={[metrics.paidOrders, metrics.pendingOrders, metrics.expiredOrders]}
          sparkColor="#16A34A"
        />
        <MetricCard
          icon={Truck}
          accent="linear-gradient(90deg, #00C2FF, #06B6D4)"
          iconBg="bg-[rgba(0,194,255,0.1)]"
          iconColor="text-[#00C2FF]"
          title="Entregas"
          value={String(metrics.deliveries)}
          subtitle="Liberadas para clientes"
          sparkData={[metrics.deliveries, metrics.paidOrders]}
          sparkColor="#00C2FF"
        />
        <MetricCard
          icon={CreditCard}
          accent="linear-gradient(90deg, #6D5DF6, #8B5CF6)"
          iconBg="bg-[rgba(109,93,246,0.1)]"
          iconColor="text-[#6D5DF6]"
          title="Ticket medio"
          value={formatCurrency(metrics.avgTicket)}
          subtitle="Valor medio por pedido"
          sparkData={[metrics.avgTicket > 0 ? 1 : 0, metrics.paidOrders > 0 ? 1 : 0]}
          sparkColor="#6D5DF6"
        />
      </div>

      {/* Funnel + Tracking Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <Card variant="neu-soft" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-[#71869B]" />
                  <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Funil</span>
                </div>
                <CardTitle className="text-base">Pedidos &gt; Pagos &gt; Entregues</CardTitle>
              </div>
              <Link href="/admin/analytics" className="text-xs text-[#0B7CFF] font-semibold hover:underline flex items-center gap-1">
                Ver analytics <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {hasOrders ? (
              <div className="space-y-3">
                {funnelStages.map((stage, i) => {
                  const Icon = stage.icon
                  const pct = (stage.count / funnelMax) * 100
                  const conversionFromPrev = i > 0 && funnelStages[i - 1].count > 0
                    ? Math.round((stage.count / funnelStages[i - 1].count) * 100)
                    : null
                  return (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 hover:scale-110" style={{ background: `${stage.color}14`, color: stage.color }}>
                            <Icon size={14} />
                          </div>
                          <span className="text-sm font-semibold text-[#081827]">{stage.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {conversionFromPrev !== null && (
                            <span className={`text-[11px] font-bold ${conversionFromPrev >= 70 ? 'text-[#16A34A]' : conversionFromPrev >= 40 ? 'text-[#F97316]' : 'text-[#DC2626]'}`}>
                              {conversionFromPrev}%
                            </span>
                          )}
                          <span className="text-sm font-extrabold text-[#081827]">{stage.count}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out relative group cursor-default"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}CC)` }}
                        >
                          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
                        </div>
                      </div>
                      {i < funnelStages.length - 1 && (
                        <div className="flex justify-center my-1">
                          <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#B0C4D8]">
                            <path d="M6 2 L10 7 L6 6 L2 7 Z" fill="currentColor" opacity="0.5" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Nenhum pedido ainda"
                desc="O funil aparecera aqui quando os clientes comecarem a comprar."
                href="/admin/products"
                cta="Criar primeiro produto"
              />
            )}
          </CardContent>
        </Card>

        {/* Tracking Health */}
        <Card variant="neu-soft">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-[#71869B]" />
              <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Tracking</span>
            </div>
            <CardTitle className="text-base">Meta Pixel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#71869B]">Score de configuracao</span>
                <span className="text-xs font-bold text-[#081827]">{trackingScore}/4</span>
              </div>
              <div className="h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(trackingScore / 4) * 100}%`, background: trackingScore === 4 ? '#16A34A' : trackingScore >= 2 ? '#F97316' : '#DC2626' }}
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <TrackingItem icon={<Radio size={14} />} label="Pixel ID" connected={trackingHealth.pixelConnected} />
              <TrackingItem icon={<Server size={14} />} label="Conversions API" connected={trackingHealth.capiConnected} />
              <TrackingItem icon={<Eye size={14} />} label="Browser tracking" connected={trackingHealth.browserTracking} />
              <TrackingItem icon={<Activity size={14} />} label="Server tracking" connected={trackingHealth.serverTracking} />
            </div>
            <Link href="/admin/settings/tracking" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#0B7CFF] font-semibold hover:underline pt-3 border-t border-[rgba(8,24,39,0.06)]">
              Configurar tracking <ArrowRight size={12} />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Order Status + Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders with timeline layout */}
        <Card variant="neu-soft" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart size={14} className="text-[#71869B]" />
                  <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Pedidos recentes</span>
                </div>
                <CardTitle className="text-base">Ultimas atividades</CardTitle>
              </div>
              <Link href="/admin/orders" className="text-xs text-[#0B7CFF] font-semibold hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Nenhum pedido ainda"
                desc="Quando os clientes comprarem, aparecerao aqui."
                href="/admin/pages"
                cta="Publicar pagina de venda"
              />
            ) : (
              <div className="space-y-0">
                {recentOrders.map((order, i) => (
                  <div key={order.id} className="relative">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FBFF] border border-[rgba(8,24,39,0.04)] hover:border-[rgba(8,24,39,0.08)] hover:shadow-sm transition-all duration-200 group">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-[rgba(11,124,255,0.06)] flex items-center justify-center">
                          <span className="text-xs font-bold text-[#0B7CFF]">
                            {order.customer_name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-[#081827] truncate group-hover:text-[#0B7CFF] transition-colors">{order.customer_name}</span>
                          <Badge variant={statusVariantMap[order.status] || 'default'} size="sm">
                            {statusLabelMap[order.status] || order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#71869B] truncate">{order.product?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#081827]">{formatCurrency(order.amount)}</p>
                        <p className="text-[11px] text-[#71869B] font-mono">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    {i < recentOrders.length - 1 && (
                      <div className="ml-[22px] w-px h-2 bg-[rgba(8,24,39,0.06)]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Donut + Secondary Metrics */}
        <div className="space-y-4">
          {/* Order Status Donut */}
          <Card variant="neu-soft">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={14} className="text-[#71869B]" />
                <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Status</span>
              </div>
              <CardTitle className="text-base">Distribuicao de pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {hasOrders ? (
                <DonutChart paid={metrics.paidOrders} pending={metrics.pendingOrders} expired={metrics.expiredOrders} total={metrics.totalOrders} />
              ) : (
                <div className="text-center py-4">
                  <Activity size={24} className="text-[#B0C4D8] mx-auto mb-2" />
                  <p className="text-xs text-[#71869B]">Sem pedidos para exibir</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Secondary Metrics */}
          <Card variant="neu-soft">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-[#71869B]" />
                <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Operacional</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SecondaryMetric icon={Clock} iconBg="bg-[rgba(249,115,22,0.08)]" iconColor="text-[#F97316]" label="Pendentes" value={metrics.pendingOrders} />
                <SecondaryMetric icon={XCircle} iconBg="bg-[rgba(220,38,38,0.08)]" iconColor="text-[#DC2626]" label="Expirados" value={metrics.expiredOrders} />
                <SecondaryMetric icon={Package} iconBg="bg-[rgba(11,124,255,0.08)]" iconColor="text-[#0B7CFF]" label="Produtos ativos" value={metrics.activeProducts} />
                <SecondaryMetric icon={Globe} iconBg="bg-[rgba(0,194,255,0.08)]" iconColor="text-[#00C2FF]" label="Paginas" value={metrics.publishedPages} />
                <SecondaryMetric icon={Archive} iconBg="bg-[rgba(22,163,74,0.08)]" iconColor="text-[#16A34A]" label="Estoque" value={metrics.availableStock} />
                <SecondaryMetric icon={HeadphonesIcon} iconBg="bg-[rgba(109,93,246,0.08)]" iconColor="text-[#6D5DF6]" label="Suportes" value={metrics.openSupport} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="neu-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-[#71869B]" />
                <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Acoes rapidas</span>
              </div>
              <CardTitle className="text-base">Atalhos da operacao</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: '/admin/products', icon: Package, label: 'Novo produto', desc: 'Cadastrar uma nova oferta digital', color: 'bg-[rgba(109,93,246,0.08)] text-[#6D5DF6]' },
              { href: '/admin/pages', icon: Globe, label: 'Nova pagina', desc: 'Criar uma pagina publica de venda', color: 'bg-[rgba(0,194,255,0.08)] text-[#00C2FF]' },
              { href: '/admin/flows', icon: Zap, label: 'Novo fluxo', desc: 'Desenhar atendimento conversacional', color: 'bg-[rgba(11,124,255,0.08)] text-[#0B7CFF]' },
              { href: '/admin/inventory', icon: Archive, label: 'Adicionar estoque', desc: 'Subir codigos, links ou arquivos', color: 'bg-[rgba(22,163,74,0.08)] text-[#16A34A]' },
              { href: '/admin/orders', icon: ShoppingCart, label: 'Ver pedidos', desc: 'Acompanhar pagamentos e entregas', color: 'bg-[rgba(249,115,22,0.08)] text-[#F97316]' },
              { href: '/admin/settings/payments', icon: DollarSign, label: 'Pagamentos', desc: 'Configurar gateway e webhook', color: 'bg-[rgba(0,194,255,0.08)] text-[#00C2FF]' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group flex items-center gap-3.5 p-4 rounded-xl border border-[rgba(8,24,39,0.08)] hover:border-[rgba(8,24,39,0.12)] hover:shadow-md transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#081827] group-hover:text-[#0B7CFF] transition-colors">{item.label}</h3>
                  <p className="text-xs text-[#71869B] line-clamp-1">{item.desc}</p>
                </div>
                <ArrowUpRight size={16} className="text-[#B0C4D8] group-hover:text-[#0B7CFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ icon: Icon, accent, iconBg, iconColor, title, value, subtitle, sparkData, sparkColor }: { icon: React.ElementType; accent?: string; iconBg: string; iconColor: string; title: string; value: string; subtitle: string; sparkData?: number[]; sparkColor?: string }) {
  const maxSpark = sparkData ? Math.max(...sparkData, 1) : 1
  return (
    <Card variant="metric" accentColor={accent} hoverable>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
            <Icon size={20} />
          </div>
          <span className="text-xs font-semibold text-[#35516B] uppercase tracking-wider">{title}</span>
        </div>
        <div className="text-[1.75rem] font-extrabold text-[#081827] tracking-tight leading-none mb-1.5">{value}</div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#71869B]">{subtitle}</div>
          {sparkData && sparkData.length > 1 && (
            <div className="flex items-end gap-[3px] h-4">
              {sparkData.map((v, i) => (
                <div
                  key={i}
                  className="w-[4px] rounded-full transition-all duration-500"
                  style={{
                    height: `${Math.max((v / maxSpark) * 100, 15)}%`,
                    background: sparkColor || '#0B7CFF',
                    opacity: 0.3 + (i / sparkData.length) * 0.7,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SecondaryMetric({ icon: Icon, iconBg, iconColor, label, value }: { icon: React.ElementType; iconBg: string; iconColor: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
        <Icon size={14} />
      </div>
      <span className="text-sm text-[#35516B] flex-1">{label}</span>
      <span className="text-sm font-bold text-[#081827] font-mono">{value}</span>
    </div>
  )
}

function TrackingItem({ icon, label, connected }: { icon: React.ReactNode; label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${connected ? 'bg-[rgba(22,163,74,0.08)] text-[#16A34A]' : 'bg-[#EAF1F8] text-[#71869B]'}`}>
        {icon}
      </div>
      <span className="text-sm text-[#35516B] flex-1">{label}</span>
      {connected ? (
        <CheckCircle size={14} className="text-[#16A34A]" />
      ) : (
        <XCircle size={14} className="text-[#B0C4D8]" />
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, href, cta }: { icon: React.ElementType; title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-2xl bg-[#F3F7FB] flex items-center justify-center mx-auto mb-3">
        <Icon size={28} className="text-[#B0C4D8]" />
      </div>
      <p className="text-sm font-semibold text-[#35516B] mb-1">{title}</p>
      <p className="text-xs text-[#71869B] mb-4">{desc}</p>
      <Link href={href} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B7CFF]/[0.08] text-[#0B7CFF] text-xs font-bold hover:bg-[#0B7CFF]/[0.14] transition-colors">
        <Plus size={14} />
        {cta}
      </Link>
    </div>
  )
}
