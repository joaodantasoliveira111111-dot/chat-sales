'use client'

import { useState } from 'react'
import { Order } from '@/types'
import { Badge } from '@/components/ui/Cards'
import { GlassCard } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, formatDate, getStatusLabel } from '@/lib/utils'
import { ShoppingCart, Search, Eye, Zap, Copy, CheckCircle } from 'lucide-react'

export function OrdersContent({ orders: initialOrders }: { orders: (Order & { product?: { name: string } | null; delivery?: { id: string; delivered_at: string } | null })[] }) {
  const toast = useToast()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null)
  const [simulating, setSimulating] = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customer_email.includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const simulatePayment = async (orderId: string) => {
    setSimulating(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/manual-delivery`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId
          ? { ...o, status: data.delivered ? 'delivered' : 'paid_pending_stock' as any }
          : o
        ))
        toast.success(data.delivered ? 'Pagamento simulado e entrega realizada! ✅' : 'Pago - sem estoque disponível')
        setSelectedOrder(null)
      } else {
        toast.error(data.error || 'Erro ao simular')
      }
    } catch {
      toast.error('Erro ao simular pagamento')
    } finally {
      setSimulating(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="text-slate-400 text-sm mt-1">{orders.length} pedido(s)</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email, nome ou ID..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagos</option>
          <option value="delivered">Entregues</option>
          <option value="expired">Expirados</option>
          <option value="cancelled">Cancelados</option>
          <option value="paid_pending_stock">Sem estoque</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <ShoppingCart size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">{orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum resultado'}</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => (
            <GlassCard key={order.id} className="flex items-center gap-4 cursor-pointer hover:border-white/20 transition-all" onClick={() => setSelectedOrder(order)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{order.customer_name}</p>
                  <Badge status={order.status} />
                  {order.delivery && <span className="text-xs text-green-400">✓ Entregue</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{order.customer_email}</span>
                  <span>{order.product?.name}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-violet-400">{formatCurrency(order.amount)}</p>
                {order.status === 'pending' && (
                  <button
                    onClick={e => { e.stopPropagation(); simulatePayment(order.id) }}
                    disabled={simulating === order.id}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
                  >
                    <Zap size={11} />
                    {simulating === order.id ? 'Simulando...' : 'Simular pagamento'}
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Detalhes do Pedido"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="ID" value={selectedOrder.id.slice(0, 8) + '...'} />
              <InfoField label="Status" value={<Badge status={selectedOrder.status} />} />
              <InfoField label="Cliente" value={selectedOrder.customer_name} />
              <InfoField label="E-mail" value={selectedOrder.customer_email} />
              <InfoField label="Produto" value={selectedOrder.product?.name || '-'} />
              <InfoField label="Valor" value={formatCurrency(selectedOrder.amount)} />
              <InfoField label="Criado em" value={formatDate(selectedOrder.created_at)} />
              <InfoField label="Provider" value={selectedOrder.payment_provider || 'mock'} />
            </div>

            {selectedOrder.pix_code && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Código PIX</p>
                <p className="text-xs text-slate-400 break-all bg-white/3 p-2 rounded-lg">{selectedOrder.pix_code.slice(0, 100)}...</p>
              </div>
            )}

            {selectedOrder.delivery && (
              <div className="p-3 rounded-xl bg-green-400/5 border border-green-400/20">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <p className="text-sm text-green-400 font-medium">Entrega realizada</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">{formatDate(selectedOrder.delivery.delivered_at)}</p>
              </div>
            )}

            {selectedOrder.status === 'pending' && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-slate-500 mb-2">🧪 Modo Mock - Simular pagamento aprovado</p>
                <Button
                  onClick={() => simulatePayment(selectedOrder.id)}
                  loading={simulating === selectedOrder.id}
                  className="w-full"
                >
                  <Zap size={16} />
                  Simular Pagamento Aprovado
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="text-sm text-white">{value}</div>
    </div>
  )
}
