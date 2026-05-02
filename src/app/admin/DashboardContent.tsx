'use client'

import Link from 'next/link'
import { MetricCard, GlassCard } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
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
  Plus,
  ChevronRight,
  ArrowRight,
  Zap,
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
  { key: 'hasProduct', label: 'Criar produto', href: '/admin/products/new', desc: 'Defina seu produto digital' },
  { key: 'hasPage', label: 'Criar página pública', href: '/admin/pages', desc: 'Configure a vitrine do produto' },
  { key: 'hasFlow', label: 'Criar fluxo conversacional', href: '/admin/flows', desc: 'Monte a conversa de vendas' },
  { key: 'hasInventory', label: 'Adicionar entregáveis', href: '/admin/inventory', desc: 'Cadastre o estoque digital' },
  { key: 'hasPayment', label: 'Configurar pagamento', href: '/admin/settings/payments', desc: 'Conecte seu gateway Pix' },
]

export function DashboardContent({ metrics, checklist }: DashboardContentProps) {
  const checklistProgress = Object.values(checklist).filter(Boolean).length
  const checklistTotal = Object.keys(checklist).length
  const isOnboarding = checklistProgress < checklistTotal

  return (
    <div className="p-6 space-y-8">
      {/* Onboarding Banner */}
      {isOnboarding && (
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-600/10" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={18} className="text-violet-400" />
                  <h2 className="text-lg font-bold text-white">Configure o Chatfy</h2>
                </div>
                <p className="text-slate-400 text-sm">
                  Complete os passos abaixo para ativar sua primeira página de vendas.
                </p>
              </div>
              <span className="text-sm font-semibold text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full">
                {checklistProgress}/{checklistTotal}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${(checklistProgress / checklistTotal) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {checklistItems.map((item, i) => {
                const done = checklist[item.key as keyof Checklist]
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 ${
                      done
                        ? 'border-green-500/30 bg-green-500/5 cursor-default'
                        : 'border-white/10 bg-white/3 hover:border-violet-500/40 hover:bg-violet-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        done ? 'bg-green-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={`text-xs font-semibold ${done ? 'text-green-400' : 'text-slate-300'}`}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Metrics */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Visão Geral</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Faturamento Total"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign size={18} />}
            color="violet"
          />
          <MetricCard
            title="Pedidos Pagos"
            value={metrics.paidOrders}
            subtitle={`de ${metrics.totalOrders} no total`}
            icon={<CheckCircle size={18} />}
            color="green"
          />
          <MetricCard
            title="Pendentes"
            value={metrics.pendingOrders}
            icon={<Clock size={18} />}
            color="orange"
          />
          <MetricCard
            title="Entregas"
            value={metrics.deliveries}
            icon={<Truck size={18} />}
            color="cyan"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <MetricCard
            title="Produtos Ativos"
            value={metrics.activeProducts}
            icon={<Package size={18} />}
            color="blue"
          />
          <MetricCard
            title="Páginas Publicadas"
            value={metrics.publishedPages}
            icon={<Globe size={18} />}
            color="violet"
          />
          <MetricCard
            title="Estoque Disponível"
            value={metrics.availableStock}
            icon={<Archive size={18} />}
            color="green"
          />
          <MetricCard
            title="Total de Pedidos"
            value={metrics.totalOrders}
            icon={<ShoppingCart size={18} />}
            color="cyan"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/admin/products/new', icon: Package, label: 'Novo Produto', desc: 'Cadastrar produto digital', color: 'text-violet-400' },
            { href: '/admin/pages', icon: Globe, label: 'Nova Página', desc: 'Criar página de venda', color: 'text-cyan-400' },
            { href: '/admin/flows', icon: Zap, label: 'Novo Fluxo', desc: 'Construir conversa visual', color: 'text-violet-400' },
            { href: '/admin/inventory', icon: Archive, label: 'Adicionar Estoque', desc: 'Cadastrar entregáveis', color: 'text-green-400' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Ver Pedidos', desc: 'Gerenciar pedidos', color: 'text-orange-400' },
            { href: '/admin/settings/payments', icon: DollarSign, label: 'Pagamentos', desc: 'Configurar gateway', color: 'text-cyan-400' },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <GlassCard hover className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-600" />
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
