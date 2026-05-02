'use client'

import Link from 'next/link'
import { MetricCard, Card } from '@/components/ui/Cards'
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
  ChevronRight,
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
  { key: 'hasProduct', label: 'Criar produto', href: '/admin/products', desc: 'Defina seu produto digital' },
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
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Onboarding Banner */}
      {isOnboarding && (
        <Card elevated style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.1) 100%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Zap size={18} style={{ color: 'var(--primary-light)' }} />
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>Configure o Chatfy</h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Complete os passos abaixo para ativar sua primeira operação de vendas automatizada.
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-light)', background: 'rgba(124,58,237,0.15)', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
                {checklistProgress}/{checklistTotal}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div
                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', transition: 'width 0.5s ease', width: `${(checklistProgress / checklistTotal) * 100}%` }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {checklistItems.map((item, i) => {
                const done = checklist[item.key as keyof Checklist]
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', borderRadius: '12px',
                      textDecoration: 'none', transition: 'all 0.2s',
                      border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                      background: done ? 'rgba(16,185,129,0.05)' : 'var(--bg-base)',
                    }}
                    onMouseEnter={e => {
                      if (!done) {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                        e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!done) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.background = 'var(--bg-base)'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                        background: done ? '#10B981' : 'rgba(255,255,255,0.1)',
                        color: done ? '#fff' : 'var(--text-muted)'
                      }}>
                        {done ? '✓' : i + 1}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: done ? '#34D399' : 'var(--text)' }}>
                        {item.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Metrics */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Visão Geral</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
            title="Entregas Realizadas"
            value={metrics.deliveries}
            icon={<Truck size={18} />}
            color="cyan"
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
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
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Ações Rápidas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/admin/products', icon: Package, label: 'Novo Produto', desc: 'Cadastrar produto digital', color: 'rgba(124,58,237,0.2)', iconColor: '#A78BFA' },
            { href: '/admin/pages', icon: Globe, label: 'Nova Página', desc: 'Criar página de venda', color: 'rgba(6,182,212,0.2)', iconColor: '#67E8F9' },
            { href: '/admin/flows', icon: Zap, label: 'Novo Fluxo', desc: 'Construir conversa visual', color: 'rgba(124,58,237,0.2)', iconColor: '#A78BFA' },
            { href: '/admin/inventory', icon: Archive, label: 'Adicionar Estoque', desc: 'Cadastrar entregáveis', color: 'rgba(16,185,129,0.2)', iconColor: '#34D399' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Ver Pedidos', desc: 'Gerenciar pedidos', color: 'rgba(249,115,22,0.2)', iconColor: '#FB923C' },
            { href: '/admin/settings/payments', icon: DollarSign, label: 'Pagamentos', desc: 'Configurar gateway', color: 'rgba(6,182,212,0.2)', iconColor: '#67E8F9' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Card hover style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: item.color, color: item.iconColor }}>
                  <item.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.15rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-subtle)' }} />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
