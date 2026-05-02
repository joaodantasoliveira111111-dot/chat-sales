'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flow } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, Badge, EmptyState } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { slugify, formatDate } from '@/lib/utils'
import { Plus, Workflow, Edit, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

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
    if (!form.name.trim()) return toast.error('Nome é obrigatório')
    setCreating(true)
    try {
      const supabase = createClient()
      const id = uuidv4()
      const { data, error } = await supabase.from('flows').insert({
        id,
        user_id: userId,
        name: form.name.trim(),
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
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Fluxos</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{flows.length} fluxo(s) criado(s)</p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="md">
          <Plus size={15} />
          Novo Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Workflow size={24} />}
            title="Nenhum fluxo criado"
            description="Crie fluxos conversacionais inteligentes para atender e vender para seus clientes automaticamente."
            action={
              <Button onClick={() => setShowCreate(true)} size="sm">
                <Plus size={14} />
                Criar primeiro fluxo
              </Button>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {flows.map(flow => (
            <Card key={flow.id} hover>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(124,58,237,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Workflow size={20} style={{ color: 'var(--primary-light)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{flow.name}</span>
                    <Badge status={flow.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {flow.product && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📦 {flow.product.name}</span>}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 600 }}>v{flow.version}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{formatDate(flow.updated_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link href={`/admin/flows/${flow.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">
                      <Edit size={14} />
                      Editar
                    </Button>
                  </Link>
                  <button
                    onClick={() => setDeleteFlow(flow)}
                    title="Excluir"
                    style={{
                      padding: '0.5rem', borderRadius: '8px', background: 'transparent',
                      border: 'none', color: 'var(--text-subtle)', cursor: 'pointer',
                      display: 'flex', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Novo Fluxo" size="sm" footer={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setShowCreate(false)} fullWidth>Cancelar</Button>
          <Button onClick={handleCreate} loading={creating} fullWidth>Criar fluxo</Button>
        </div>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nome do fluxo"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Fluxo de Vendas Principal"
            required
          />
          {products.length > 0 && (
            <Select
              label="Produto vinculado (opcional)"
              value={form.product_id}
              onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
              hint="Você pode vincular um produto agora ou depois nas configurações da página."
            >
              <option value="">Nenhum produto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteFlow}
        onClose={() => setDeleteFlow(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir fluxo"
        description={`Tem certeza que deseja excluir "${deleteFlow?.name}"? Todas as conexões e configurações serão permanentemente removidas.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}
