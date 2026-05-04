'use client'

import { useState } from 'react'
import { SupportRequest } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { HeadphonesIcon, Search, MessageSquare, Mail, Phone, Calendar, User } from 'lucide-react'

export function SupportContent({ requests: initialRequests }: { requests: SupportRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [selected, setSelected] = useState<SupportRequest | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abertos' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'resolved', label: 'Resolvidos' },
    { value: 'closed', label: 'Fechados' },
  ]

  const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    open: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'default',
  }

  const statusLabelMap: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
  }

  const filtered = requests.filter(r => {
    const matchSearch = !search || 
      r.message.toLowerCase().includes(search.toLowerCase()) || 
      r.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true)
    try {
      const supabase = createClient()
      await supabase.from('support_requests').update({ status }).eq('id', id)
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r))
      setSelected(prev => prev?.id === id ? { ...prev, status: status as any } : prev)
    } catch {
      // Handle error silently
    } finally {
      setUpdating(false)
    }
  }

  const openCount = requests.filter(r => r.status === 'open').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081827]">
            Suporte
          </h1>
          <p className="text-sm text-[#35516B] mt-1">
            {openCount} solicitação{openCount !== 1 ? 'ões' : ''} aberta{openCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71869B] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="w-full h-10 pl-10 pr-4 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] text-[#081827] placeholder:text-[#71869B]"
        />
      </div>
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value)}
        className="h-10 px-4 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] text-[#081827]"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<HeadphonesIcon className="w-12 h-12 text-[#71869B]" />}
              title={requests.length === 0 ? 'Nenhuma solicitação de suporte' : 'Nenhum resultado'}
              description={requests.length === 0 ? 'As solicitações de suporte dos seus clientes aparecerão aqui.' : 'Tente ajustar os filtros.'}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <Card key={req.id} hoverable>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSelected(req)}>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[rgba(109,93,246,0.08)] flex items-center justify-center">
                    <MessageSquare size={24} className="text-[#6D5DF6]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#081827]">
                        {req.customer_name || req.customer_email || 'Anônimo'}
                      </h3>
                      <Badge variant={statusVariantMap[req.status] || 'default'} size="sm">
                        {statusLabelMap[req.status] || req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#35516B] line-clamp-2">
                      {req.message}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-[#71869B] flex-shrink-0">
                    {formatDate(req.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Solicitação de Suporte"
        size="md"
      >
        {selected && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Nome</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selected.customer_name || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">E-mail</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {selected.customer_email || '-'}
                </p>
              </div>

              {selected.customer_whatsapp && (
                <div className="space-y-1">
                  <p className="text-xs text-[#71869B] font-medium">WhatsApp</p>
                  <p className="text-sm font-semibold text-[#081827]">
                    {selected.customer_whatsapp}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-[#71869B] font-medium">Data</p>
                <p className="text-sm font-semibold text-[#081827]">
                  {formatDate(selected.created_at)}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#081827]">Mensagem</p>
              <div className="p-4 bg-[#F3F7FB] rounded-xl border border-[rgba(8,24,39,0.08)] text-sm text-[#4A6178] whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            {/* Status Update */}
            <div className="pt-4 border-t border-[rgba(8,24,39,0.08)]">
              <Select
                label="Alterar status"
                value={selected.status}
                onChange={value => updateStatus(selected.id, value)}
                options={[
                  { value: 'open', label: 'Aberto' },
                  { value: 'in_progress', label: 'Em andamento' },
                  { value: 'resolved', label: 'Resolvido' },
                  { value: 'closed', label: 'Fechado' },
                ]}
                fullWidth
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}