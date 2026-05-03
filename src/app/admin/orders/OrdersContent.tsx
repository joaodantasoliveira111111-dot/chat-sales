'use client'

import { useState } from 'react'
import { Order } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingCart, Search, Eye, Zap, Copy, CheckCircle, Calendar, User, Mail, Package, CreditCard } from 'lucide-react'

export function OrdersContent({ orders: initialOrders }: { orders: (Order & { product?: { name: string } | null; delivery?: { id: string; delivered_at: string } | null })[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null)
  const [simulating, setSimulating] = useState<string | null>(null)

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'paid', label: 'Pagos' },
    { value: 'delivered', label: 'Entregues' },
    { value: 'expired', label: 'Expirados' },
    { value: 'cancelled', label: 'Cancelados' },
    { value: 'paid_pending_stock', label: 'Sem estoque' },
  ]

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

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
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
        setSelectedOrder(null)
      }
    } catch {
      // Handle error silently
    } finally {
      setSimulating(null)
    }
  }

  const handleCopyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode)
      // Could add toast notification here
    } catch {
      // Handle error silently
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Pedidos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email, nome ou ID..."
            className="w-full h-10 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<ShoppingCart className="w-12 h-12 text-slate-300" />}
              title={orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum resultado'}
              description={orders.length === 0 ? 'Quando seus clientes comprarem, os pedidos aparecerão aqui.' : 'Tente ajustar os filtros.'}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Card key={order.id} hoverable>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-orange-100 flex items-center justify-center">
                    <ShoppingCart size={24} className="text-orange-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{order.customer_name}</h3>
                      <Badge variant={statusVariantMap[order.status] || 'default'} size="sm">
                        {statusLabelMap[order.status] || order.status}
                      </Badge>
                      {order.delivery && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle size={12} />
                          Entregue
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {order.customer_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {order.product?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-cyan-600">
                      {formatCurrency(order.amount)}
                    </p>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => simulatePayment(order.id)}
                        disabled={simulating === order.id}
                        className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <Zap size={12} />
                        {simulating === order.id ? 'Simulando...' : 'Simular'}
                      </button>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </CardContent>
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
          <div className="space-y-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">ID do Pedido</p>
                <p className="text-sm font-semibold text-slate-900 font-mono">
                  {selectedOrder.id.slice(0, 12)}...
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Status</p>
                <Badge variant={statusVariantMap[selectedOrder.status] || 'default'}>
                  {statusLabelMap[selectedOrder.status] || selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Cliente</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedOrder.customer_name}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">E-mail</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedOrder.customer_email}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Produto</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedOrder.product?.name || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Valor</p>
                <p className="text-sm font-bold text-cyan-600">
                  {formatCurrency(selectedOrder.amount)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Criado em</p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Provider</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedOrder.payment_provider || 'Mock'}
                </p>
              </div>
            </div>

            {/* PIX Code */}
            {selectedOrder.pix_code && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Código PIX</p>
                <div className="relative">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 break-all">
                    {selectedOrder.pix_code}
                  </div>
                  <button
                    onClick={() => selectedOrder.pix_code && handleCopyPix(selectedOrder.pix_code)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Copiar código PIX"
                  >
                    <Copy size={14} className="text-slate-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Status */}
            {selectedOrder.delivery && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={20} className="text-green-600" />
                  <p className="font-semibold text-green-900">Entrega realizada</p>
                </div>
                <p className="text-sm text-green-700">
                  {formatDate(selectedOrder.delivery.delivered_at)}
                </p>
              </div>
            )}

            {/* Simulate Payment */}
            {selectedOrder.status === 'pending' && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-3">
                  🧪 Modo Mock - Simular pagamento aprovado
                </p>
                <Button
                  onClick={() => simulatePayment(selectedOrder.id)}
                  isLoading={simulating === selectedOrder.id}
                  fullWidth
                  leftIcon={<Zap size={18} />}
                >
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