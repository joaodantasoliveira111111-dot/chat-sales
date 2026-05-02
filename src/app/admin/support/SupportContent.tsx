'use client'

import { useState } from 'react'
import { SupportRequest } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { GlassCard, Badge } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { HeadphonesIcon, Search, MessageSquare } from 'lucide-react'

export function SupportContent({ requests: initialRequests }: { requests: SupportRequest[] }) {
  const toast = useToast()
  const [requests, setRequests] = useState(initialRequests)
  const [selected, setSelected] = useState<SupportRequest | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.message.toLowerCase().includes(search.toLowerCase()) || r.customer_email?.includes(search)
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
      toast.success('Status atualizado')
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Suporte</h1>
        <p className="text-slate-400 text-sm mt-1">{requests.filter(r => r.status === 'open').length} solicitação(ões) abertas</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none">
          <option value="all">Todos</option>
          <option value="open">Abertos</option>
          <option value="in_progress">Em andamento</option>
          <option value="resolved">Resolvidos</option>
          <option value="closed">Fechados</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <HeadphonesIcon size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">{requests.length === 0 ? 'Nenhuma solicitação de suporte' : 'Nenhum resultado'}</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(req => (
            <GlassCard key={req.id} className="flex items-center gap-4 cursor-pointer hover:border-white/20" onClick={() => setSelected(req)}>
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{req.customer_name || req.customer_email || 'Anônimo'}</p>
                  <Badge status={req.status} />
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{req.message}</p>
              </div>
              <p className="text-xs text-slate-600 flex-shrink-0">{formatDate(req.created_at)}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Solicitação de Suporte" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-500 mb-1">Nome</p><p className="text-sm text-white">{selected.customer_name || '-'}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">E-mail</p><p className="text-sm text-white">{selected.customer_email || '-'}</p></div>
              {selected.customer_whatsapp && <div><p className="text-xs text-slate-500 mb-1">WhatsApp</p><p className="text-sm text-white">{selected.customer_whatsapp}</p></div>}
              <div><p className="text-xs text-slate-500 mb-1">Data</p><p className="text-sm text-white">{formatDate(selected.created_at)}</p></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Mensagem</p>
              <div className="p-3 rounded-xl bg-white/3 border border-white/8 text-sm text-slate-300 whitespace-pre-wrap">{selected.message}</div>
            </div>
            <Select
              label="Alterar status"
              value={selected.status}
              onChange={e => updateStatus(selected.id, e.target.value)}
            >
              <option value="open">Aberto</option>
              <option value="in_progress">Em andamento</option>
              <option value="resolved">Resolvido</option>
              <option value="closed">Fechado</option>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  )
}
