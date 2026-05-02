'use client'

import { useState } from 'react'
import { Order } from '@/types'
import { Badge, Card, EmptyState } from '@/components/ui/Cards'
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
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Pedidos</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{orders.length} pedido(s)</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email, nome ou ID..."
            className="neu-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="neu-input"
          style={{ width: 'auto', minWidth: '150px' }}
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
        <Card>
          <EmptyState
            icon={<ShoppingCart size={24} />}
            title={orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum resultado'}
            description={orders.length === 0 ? 'Quando seus clientes comprarem, os pedidos aparecerão aqui.' : 'Tente ajustar os filtros.'}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map(order => (
            <Card key={order.id} hover onClick={() => setSelectedOrder(order)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{order.customer_name}</span>
                    <Badge status={order.status} />
                    {order.delivery && <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 600 }}>✓ Entregue</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    <span>{order.customer_email}</span>
                    <span>📦 {order.product?.name}</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-light)' }}>{formatCurrency(order.amount)}</p>
                  {order.status === 'pending' && (
                    <button
                      onClick={e => { e.stopPropagation(); simulatePayment(order.id) }}
                      disabled={simulating === order.id}
                      style={{
                        fontSize: '0.7rem', color: '#67E8F9', background: 'transparent', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem',
                      }}
                    >
                      <Zap size={11} />
                      {simulating === order.id ? 'Simulando...' : 'Simular'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Código PIX</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)', wordBreak: 'break-all' }}>
                  {selectedOrder.pix_code.slice(0, 100)}...
                </p>
              </div>
            )}

            {selectedOrder.delivery && (
              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} style={{ color: '#34D399' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34D399' }}>Entrega realizada</p>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{formatDate(selectedOrder.delivery.delivered_at)}</p>
              </div>
            )}

            {selectedOrder.status === 'pending' && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🧪 Modo Mock - Simular pagamento aprovado</p>
                <Button
                  onClick={() => simulatePayment(selectedOrder.id)}
                  loading={simulating === selectedOrder.id}
                  fullWidth
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
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</p>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}
