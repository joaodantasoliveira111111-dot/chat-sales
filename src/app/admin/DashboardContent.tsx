'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  Sparkles,
  ArrowUpRight,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Radio,
  Server,
  Shield,
  BarChart3,
  Users,
  XCircle,
  HeadphonesIcon,
  CreditCard,
  ArrowRight,
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
  product?: { name: string }[] | { name: string } | null
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

export function DashboardContent({ metrics, checklist, recentOrders, trackingHealth }: DashboardContentProps) {
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card variant="neu" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B7CFF]/5 via-transparent to-[#00C2FF]/5 pointer-events-none" />
        <CardContent className="relative p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-[rgba(11,124,255,0.1)] flex items-center justify-center">
                  <Sparkles size={14} className="text-[#0B7CFF]" />
                </div>
                <span className="text-xs font-bold text-[#0B7CFF] uppercase tracking-wider">
                  Centro de operacoes
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#081827] tracking-tight mb-2">
                Venda, entregue e acompanhe tudo em um painel.
              </h2>
              <p className="text-sm text-[#35516B] leading-relaxed">
                Visao clara do funil conversacional, entregas digitais e pontos que precisam de atencao.
              </p>
            </div>

            <div className="lg:min-w-[260px] bg-white/80 backdrop-blur-sm rounded-[16px] p-5 border border-[rgba(8,24,39,0.08)] shadow-[6px_6px_16px_rgba(8,24,39,0.04),-4px_-4px_12px_rgba(255,255,255,0.7)]">
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
              <Link key={i} href={alert.href} className={`group flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${bgMap[alert.type]}`}>
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
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
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
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {checklistItems.map((item, index) => {
                const done = checklist[item.key as keyof Checklist]
                return (
                  <Link key={item.key} href={item.href} className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${done ? 'bg-[rgba(22,163,74,0.04)] border-[rgba(22,163,74,0.2)]' : 'bg-white border-[rgba(8,24,39,0.08)] hover:border-[rgba(109,93,246,0.3)] hover:shadow-md'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${done ? 'bg-[rgba(22,163,74,0.1)] text-[#16A34A]' : 'bg-[#F3F7FB] text-[#35516B]'}`}>
                        {done ? <CheckCircle size={18} /> : <span className="text-sm font-bold">{index + 1}</span>}
                      </div>
                      <item.icon size={18} className={done ? 'text-[#16A34A]' : 'text-[#71869B]'} />
                    </div>
                    <h3 className="font-bold text-sm text-[#081827] mb-0.5">{item.label}</h3>
                    <p className="text-xs text-[#35516B] leading-snug">{item.desc}</p>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} accent="linear-gradient(90deg, #0B7CFF, #00C2FF)" iconBg="bg-[rgba(11,124,255,0.1)]" iconColor="text-[#0B7CFF]" title="Faturamento" value={formatCurrency(metrics.totalRevenue)} subtitle="Receita aprovada" />
        <MetricCard icon={CheckCircle} accent="linear-gradient(90deg, #16A34A, #22C55E)" iconBg="bg-[rgba(22,163,74,0.1)]" iconColor="text-[#16A34A]" title="Pedidos pagos" value={String(metrics.paidOrders)} subtitle={`${metrics.totalOrders} total`} />
        <MetricCard icon={Truck} accent="linear-gradient(90deg, #00C2FF, #06B6D4)" iconBg="bg-[rgba(0,194,255,0.1)]" iconColor="text-[#00C2FF]" title="Entregas" value={String(metrics.deliveries)} subtitle="Liberadas para clientes" />
        <MetricCard icon={CreditCard} accent="linear-gradient(90deg, #6D5DF6, #8B5CF6)" iconBg="bg-[rgba(109,93,246,0.1)]" iconColor="text-[#6D5DF6]" title="Ticket medio" value={formatCurrency(metrics.avgTicket)} subtitle="Valor medio por pedido" />
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
            <div className="space-y-3">
              {funnelStages.map((stage, i) => {
                const Icon = stage.icon
                const pct = (stage.count / funnelMax) * 100
                return (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${stage.color}14`, color: stage.color }}>
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-semibold text-[#081827]">{stage.label}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#081827]">{stage.count}</span>
                    </div>
                    <div className="h-2.5 bg-[#EAF1F8] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}CC)` }} />
                    </div>
                    {i < funnelStages.length - 1 && (
                      <div className="flex justify-center my-1">
                        <div className="w-px h-3 bg-[rgba(8,24,39,0.08)]" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {metrics.totalOrders === 0 && (
              <div className="text-center py-6">
                <BarChart3 size={32} className="text-[#B0C4D8] mx-auto mb-2" />
                <p className="text-sm text-[#71869B]">Nenhum pedido ainda. O funil aparecera aqui.</p>
              </div>
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
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(trackingScore / 4) * 100}%`, background: trackingScore === 4 ? '#16A34A' : trackingScore >= 2 ? '#F97316' : '#DC2626' }} />
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

      {/* Recent Orders + Secondary Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
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
              <div className="text-center py-8">
                <ShoppingCart size={32} className="text-[#B0C4D8] mx-auto mb-2" />
                <p className="text-sm text-[#71869B]">Nenhum pedido ainda. Quando os clientes comprarem, aparecerao aqui.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FBFF] border border-[rgba(8,24,39,0.04)]">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(249,115,22,0.08)] flex items-center justify-center flex-shrink-0">
                      <ShoppingCart size={16} className="text-[#F97316]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#081827] truncate">{order.customer_name}</span>
                        <Badge variant={statusVariantMap[order.status] || 'default'} size="sm">
                          {statusLabelMap[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#71869B] truncate">{(Array.isArray(order.product) ? order.product[0]?.name : order.product?.name) || 'N/A'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#081827]">{formatCurrency(order.amount)}</p>
                      <p className="text-xs text-[#71869B]">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary Metrics */}
        <Card variant="neu-soft">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-[#71869B]" />
              <span className="text-[10px] font-bold text-[#71869B] uppercase tracking-widest">Status</span>
            </div>
            <CardTitle className="text-base">Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <SecondaryMetric icon={Clock} iconBg="bg-[rgba(249,115,22,0.08)]" iconColor="text-[#F97316]" label="Pedidos pendentes" value={metrics.pendingOrders} />
              <SecondaryMetric icon={XCircle} iconBg="bg-[rgba(220,38,38,0.08)]" iconColor="text-[#DC2626]" label="Pedidos expirados" value={metrics.expiredOrders} />
              <SecondaryMetric icon={Package} iconBg="bg-[rgba(11,124,255,0.08)]" iconColor="text-[#0B7CFF]" label="Produtos ativos" value={metrics.activeProducts} />
              <SecondaryMetric icon={Globe} iconBg="bg-[rgba(0,194,255,0.08)]" iconColor="text-[#00C2FF]" label="Paginas publicadas" value={metrics.publishedPages} />
              <SecondaryMetric icon={Archive} iconBg="bg-[rgba(22,163,74,0.08)]" iconColor="text-[#16A34A]" label="Estoque disponivel" value={metrics.availableStock} />
              <SecondaryMetric icon={HeadphonesIcon} iconBg="bg-[rgba(109,93,246,0.08)]" iconColor="text-[#6D5DF6]" label="Suportes abertos" value={metrics.openSupport} />
            </div>
          </CardContent>
        </Card>
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
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
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

function MetricCard({ icon: Icon, accent, iconBg, iconColor, title, value, subtitle }: { icon: React.ElementType; accent?: string; iconBg: string; iconColor: string; title: string; value: string; subtitle: string }) {
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
        <div className="text-xs text-[#71869B]">{subtitle}</div>
      </CardContent>
    </Card>
  )
}

function SecondaryMetric({ icon: Icon, iconBg, iconColor, label, value }: { icon: React.ElementType; iconBg: string; iconColor: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
        <Icon size={14} />
      </div>
      <span className="text-sm text-[#35516B] flex-1">{label}</span>
      <span className="text-sm font-bold text-[#081827]">{value}</span>
    </div>
  )
}

function TrackingItem({ icon, label, connected }: { icon: React.ReactNode; label: string; connected: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${connected ? 'bg-[rgba(22,163,74,0.08)] text-[#16A34A]' : 'bg-[#EAF1F8] text-[#71869B]'}`}>
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
