'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Order } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ShoppingCart, Search, Eye, Zap, Copy, CheckCircle, Calendar, User, Mail, Package, CreditCard } from 'lucide-react'

export function OrdersContent({
  orders: initialOrders,
  totalCount,
  currentPage,
  totalPages,
}: {
  orders: (Order & { product?: { name: string } | null; delivery?: { id: string; delivered_at: string } | null })[]
  totalCount: number
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null)
  const [simulating, setSimulating] = useState<string | null>(null)
  const toast = useToast()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

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
      toast.success('Entrega processada com sucesso')
    } catch {
      toast.error('Erro ao processar entrega')
    } finally {
      setSimulating(null)
    }
  }

  const handleCopyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode)
      toast.success('Código Pix copiado!')
    } catch {
      toast.error('Erro ao copiar código Pix')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081827]">
            Pedidos
          </h1>
        <p className="text-sm text-[#35516B] mt-1">
          {totalCount} pedido{totalCount !== 1 ? 's' : ''}
        </p>
        </div>
      </div>

{/* Filters */}
<div className="flex flex-col sm:flex-row gap-3">
  <SearchInput value={search} onChange={setSearch} placeholder="Buscar por email, nome ou ID..." />
  <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<ShoppingCart className="w-12 h-12 text-[#71869B]" />}
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
                <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[rgba(249,115,22,0.08)] flex items-center justify-center">
                  <ShoppingCart size={24} className="text-[#F97316]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#081827]">{order.customer_name}</h3>
                      <Badge variant={statusVariantMap[order.status] || 'default'} size="sm">
                        {statusLabelMap[order.status] || order.status}
                      </Badge>
                      {order.delivery && (
                        <span className="text-xs text-[#16A34A] font-medium flex items-center gap-1">
                          <CheckCircle size={12} />
                          Entregue
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#35516B]">
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
              <p className="text-lg font-bold text-[#0B7CFF]">
                {formatCurrency(order.amount)}
              </p>
              {order.status === 'pending' && (
                <button
                  onClick={() => simulatePayment(order.id)}
                  disabled={simulating === order.id}
                  className="mt-2 text-xs text-[#0B7CFF] hover:text-[#0A6FE6] font-medium flex items-center gap-1 disabled:opacity-50"
                      >
                        <Zap size={12} />
                        {simulating === order.id ? 'Simulando...' : 'Simular'}
                      </button>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
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

    <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

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
                <p className="text-xs text-[#71869B] font-medium">ID do Pedido</p>
                <p className="text-sm font-semibold text-[#081827] font-mono">
                  {selectedOrder.id.slice(0, 12)}...
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Status</p>
                <Badge variant={statusVariantMap[selectedOrder.status] || 'default'}>
                  {statusLabelMap[selectedOrder.status] || selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Cliente</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selectedOrder.customer_name}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">E-mail</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selectedOrder.customer_email}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Produto</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selectedOrder.product?.name || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Valor</p>
                <p className="text-sm font-bold text-[#0B7CFF]">
                  {formatCurrency(selectedOrder.amount)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Criado em</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Provider</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selectedOrder.payment_provider || 'Mock'}
                </p>
              </div>
            </div>

            {/* PIX Code */}
            {selectedOrder.pix_code && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#081827]">Código PIX</p>
                <div className="relative">
                  <div className="p-3 bg-[#F3F7FB] rounded-xl border border-[rgba(8,24,39,0.08)] text-xs font-mono text-[#35516B] break-all">
                    {selectedOrder.pix_code}
                  </div>
                  <button
                    onClick={() => selectedOrder.pix_code && handleCopyPix(selectedOrder.pix_code)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-md border border-[rgba(8,24,39,0.08)] hover:bg-[#F3F7FB] transition-colors"
                    title="Copiar código PIX"
                  >
                    <Copy size={14} className="text-[#35516B]" />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Status */}
            {selectedOrder.delivery && (
              <div className="p-4 bg-[rgba(22,163,74,0.04)] rounded-xl border border-[rgba(22,163,74,0.15)]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={20} className="text-[#16A34A]" />
                  <p className="font-semibold text-[#16A34A]">Entrega realizada</p>
                </div>
                <p className="text-sm text-[#35516B]">
                  {formatDate(selectedOrder.delivery.delivered_at)}
                </p>
              </div>
            )}

            {/* Simulate Payment */}
            {selectedOrder.status === 'pending' && (
              <div className="pt-4 border-t border-[rgba(8,24,39,0.08)]">
                <p className="text-xs text-[#71869B] mb-3">
                  <Zap size={14} className="inline-block mr-1 text-[#F97316] align-text-bottom" /> Modo Mock - Simular pagamento aprovado
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