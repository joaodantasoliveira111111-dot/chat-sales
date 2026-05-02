'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flow } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { GlassCard, Badge } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { slugify } from '@/lib/utils'
import { Plus, Workflow, Edit, Trash2, ExternalLink, Zap } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { formatDate } from '@/lib/utils'

export function FlowsContent({
  flows: initialFlows,
  products,
  userId,
}: {
  flows: (Flow & { product?: { name: string } | null })[]
  products: { id: string; name: string }[]
  userId: string
}) {
  const router = useRouter()
  const toast = useToast()
  const [flows, setFlows] = useState(initialFlows)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteFlow, setDeleteFlow] = useState<Flow | null>(null)
  const [form, setForm] = useState({ name: '', product_id: '' })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async () => {
    if (!form.name) return toast.error('Nome é obrigatório')
    setCreating(true)
    try {
      const supabase = createClient()
      const id = uuidv4()
      const { data, error } = await supabase.from('flows').insert({
        id,
        user_id: userId,
        name: form.name,
        slug: slugify(form.name),
        product_id: form.product_id || null,
        status: 'draft',
        version: 1,
      }).select().single()
      if (error) throw error
      toast.success('Fluxo criado! Abrindo editor...')
      router.push(`/admin/flows/${id}`)
    } catch {
      toast.error('Erro ao criar fluxo')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteFlow) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('flows').delete().eq('id', deleteFlow.id)
      setFlows(flows.filter(f => f.id !== deleteFlow.id))
      toast.success('Fluxo removido')
      setDeleteFlow(null)
    } catch {
      toast.error('Erro ao remover')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fluxos</h1>
          <p className="text-slate-400 text-sm mt-1">{flows.length} fluxo(s) criado(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Novo Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Workflow size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-2">Nenhum fluxo criado</p>
          <p className="text-slate-500 text-sm mb-6">Crie fluxos conversacionais para suas páginas de venda.</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Criar primeiro fluxo
          </Button>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {flows.map(flow => (
            <GlassCard key={flow.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                <Workflow size={18} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{flow.name}</p>
                  <Badge status={flow.status} />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {flow.product && <p className="text-xs text-slate-500">{flow.product.name}</p>}
                  <p className="text-xs text-slate-600">v{flow.version}</p>
                  <p className="text-xs text-slate-600">{formatDate(flow.updated_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/flows/${flow.id}`}>
                  <Button variant="secondary" size="sm">
                    <Edit size={14} />
                    Editar
                  </Button>
                </Link>
                <button
                  onClick={() => setDeleteFlow(flow)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Novo Fluxo" size="sm">
        <div className="space-y-4">
          <Input
            label="Nome do fluxo"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Fluxo de Vendas Principal"
            required
          />
          {products.length > 0 && (
            <Select
              label="Produto (opcional)"
              value={form.product_id}
              onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
            >
              <option value="">Sem produto vinculado</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreate} loading={creating} className="flex-1">Criar e abrir editor</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteFlow}
        onClose={() => setDeleteFlow(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir fluxo"
        description={`Excluir "${deleteFlow?.name}"? Todos os nós e conexões serão removidos.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}
