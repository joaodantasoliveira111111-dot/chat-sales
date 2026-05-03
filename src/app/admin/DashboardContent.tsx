'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
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
} from 'lucide-react'

interface DashboardMetrics {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  activeProducts: number
  publishedPages: number
  availableStock: number
  deliveries: number
  totalRevenue: number
}

interface Checklist {
  hasProduct: boolean
  hasPage: boolean
  hasFlow: boolean
  hasInventory: boolean
  hasPayment: boolean
}

interface DashboardContentProps {
  metrics: DashboardMetrics
  checklist: Checklist
}

const checklistItems = [
  { key: 'hasProduct', label: 'Produto criado', href: '/admin/products', desc: 'Defina oferta, preço e detalhes.', icon: Package },
  { key: 'hasPage', label: 'Página publicada', href: '/admin/pages', desc: 'Prepare a experiência de venda.', icon: Globe },
  { key: 'hasFlow', label: 'Fluxo configurado', href: '/admin/flows', desc: 'Monte a conversa automatizada.', icon: Zap },
  { key: 'hasInventory', label: 'Entrega pronta', href: '/admin/inventory', desc: 'Cadastre os entregáveis digitais.', icon: Archive },
  { key: 'hasPayment', label: 'Pagamento ativo', href: '/admin/settings/payments', desc: 'Conecte seu gateway Pix.', icon: DollarSign },
] as const

const quickActions = [
  { href: '/admin/products', icon: Package, label: 'Novo produto', desc: 'Cadastrar uma nova oferta digital', color: 'bg-violet-100 text-violet-600' },
  { href: '/admin/pages', icon: Globe, label: 'Nova página', desc: 'Criar uma página pública de venda', color: 'bg-cyan-100 text-cyan-600' },
  { href: '/admin/flows', icon: Zap, label: 'Novo fluxo', desc: 'Desenhar atendimento conversacional', color: 'bg-violet-100 text-violet-600' },
  { href: '/admin/inventory', icon: Archive, label: 'Adicionar estoque', desc: 'Subir códigos, links ou arquivos', color: 'bg-green-100 text-green-600' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Ver pedidos', desc: 'Acompanhar pagamentos e entregas', color: 'bg-orange-100 text-orange-600' },
  { href: '/admin/settings/payments', icon: DollarSign, label: 'Pagamentos', desc: 'Configurar gateway e webhook', color: 'bg-cyan-100 text-cyan-600' },
] as const

const metricCards = [
  {
    key: 'revenue',
    title: 'Faturamento total',
    value: (metrics: DashboardMetrics) => formatCurrency(metrics.totalRevenue),
    subtitle: 'Receita aprovada e entregue',
    icon: DollarSign,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    key: 'paidOrders',
    title: 'Pedidos pagos',
    value: (metrics: DashboardMetrics) => metrics.paidOrders,
    subtitle: (metrics: DashboardMetrics) => `de ${metrics.totalOrders} pedido(s)`,
    icon: CheckCircle,
    color: 'bg-green-100 text-green-600',
  },
  {
    key: 'pendingOrders',
    title: 'Pendentes',
    value: (metrics: DashboardMetrics) => metrics.pendingOrders,
    subtitle: 'Aguardando confirmação',
    icon: Clock,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    key: 'deliveries',
    title: 'Entregas realizadas',
    value: (metrics: DashboardMetrics) => metrics.deliveries,
    subtitle: 'Liberadas para clientes',
    icon: Truck,
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    key: 'activeProducts',
    title: 'Produtos ativos',
    value: (metrics: DashboardMetrics) => metrics.activeProducts,
    subtitle: 'Disponíveis para venda',
    icon: Package,
    color: 'bg-violet-100 text-violet-600',
  },
  {
    key: 'publishedPages',
    title: 'Páginas publicadas',
    value: (metrics: DashboardMetrics) => metrics.publishedPages,
    subtitle: 'Experiências no ar',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    key: 'availableStock',
    title: 'Estoque disponível',
    value: (metrics: DashboardMetrics) => metrics.availableStock,
    subtitle: 'Itens prontos para entrega',
    icon: Archive,
    color: 'bg-green-100 text-green-600',
  },
  {
    key: 'totalOrders',
    title: 'Total de pedidos',
    value: (metrics: DashboardMetrics) => metrics.totalOrders,
    subtitle: 'Histórico da conta',
    icon: ShoppingCart,
    color: 'bg-cyan-100 text-cyan-600',
  },
] as const

export function DashboardContent({ metrics, checklist }: DashboardContentProps) {
  const checklistProgress = Object.values(checklist).filter(Boolean).length
  const checklistTotal = Object.keys(checklist).length
  const progressPercent = Math.round((checklistProgress / checklistTotal) * 100)
  const isOnboarding = checklistProgress < checklistTotal
  const conversionRate = metrics.totalOrders > 0
    ? Math.round((metrics.paidOrders / metrics.totalOrders) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Centro de operação
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Venda, entregue e acompanhe tudo em um painel.
              </h2>
              <p className="text-slate-600">
                Tenha uma visão clara do funil conversacional, das entregas digitais e dos pontos que precisam de atenção.
              </p>
            </div>
            
            <div className="lg:min-w-[280px] bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Taxa de conversão</span>
                <Badge variant="success" size="sm">
                  {conversionRate > 50 ? 'Acima da média' : 'Em análise'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-slate-900">{conversionRate}%</span>
                {conversionRate > 0 && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <TrendingUp size={16} className="mr-1" />
                    <span>Positivo</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {metrics.paidOrders} pagos de {metrics.totalOrders} pedido(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Section */}
      {isOnboarding && (
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-violet-600" />
                  <span className="text-sm font-semibold text-violet-700 uppercase tracking-wider">
                    Progresso inicial
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">
                  Configure sua primeira operação
                </CardTitle>
                <p className="text-slate-600">
                  Complete os passos essenciais para deixar a venda pronta para rodar.
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">{progressPercent}%</div>
                <div className="text-sm text-slate-500">
                  {checklistProgress}/{checklistTotal} etapas
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {checklistItems.map((item, index) => {
                const done = checklist[item.key as keyof Checklist]
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${done 
                        ? 'bg-green-50 border-green-200 hover:border-green-300' 
                        : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {done ? (
                          <CheckCircle size={18} />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <item.icon size={18} className={done ? 'text-green-600' : 'text-slate-400'} />
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-1">{item.label}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Visão geral
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Indicadores principais</h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Dados consolidados da sua operação atual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon
            const value = typeof card.value === 'function' ? card.value(metrics) : metrics[card.key as keyof DashboardMetrics]
            const subtitle = typeof card.subtitle === 'function' ? card.subtitle(metrics) : card.subtitle

            return (
              <Card key={card.key} hoverable>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-slate-900">
                      {value}
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium text-slate-600">
                    {card.title}
                  </div>
                  
                  <div className="text-xs text-slate-500 mt-1">
                    {subtitle}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-slate-600" />
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Ações rápidas
                </span>
              </div>
              <CardTitle>Atalhos da operação</CardTitle>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Crie, publique e acompanhe os principais fluxos de trabalho.
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={24} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                
                <ArrowUpRight size={20} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}