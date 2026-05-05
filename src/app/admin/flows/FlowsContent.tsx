'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flow } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { buildSalesTemplateFlow, getSalesTemplate, salesTemplates, SalesTemplateId } from '@/lib/flows/salesTemplates'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Toast, useToast } from '@/components/ui/Toast'
import { slugify, formatDate } from '@/lib/utils'
import { Plus, Workflow, Edit, Trash2, BarChart3 } from 'lucide-react'

export interface FlowFunnel {
  entered: number
  replied: number
  priceViewed: number
  pixGenerated: number
  paid: number
  delivered: number
}

export function FlowsContent({
  flows: initialFlows,
  products,
  userId,
  funnelByFlow = {},
}: {
  flows: (Flow & { product?: { name: string } | null })[]
  products: { id: string; name: string; price?: number }[]
  userId: string
  funnelByFlow?: Record<string, FlowFunnel>
}) {
  const router = useRouter()
  const toast = useToast()
  const [flows, setFlows] = useState(initialFlows)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteFlow, setDeleteFlow] = useState<Flow | null>(null)
  const [form, setForm] = useState({
    name: '',
    product_id: '',
    template_id: 'account_credentials' as SalesTemplateId,
    delivery_type: '',
    visual_template: 'whatsapp',
    support_whatsapp: '',
    gateway: 'default',
  })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setForm({
      name: '',
      product_id: '',
      template_id: 'account_credentials',
      delivery_type: '',
      visual_template: 'whatsapp',
      support_whatsapp: '',
      gateway: 'default',
    })
  }

  const handleCreate = async () => {
    setFormError(null)
    if (!form.name.trim()) {
      const message = 'Nome e obrigatorio'
      setFormError(message)
      toast.error(message)
      return
    }

    setCreating(true)
    try {
      const supabase = createClient()
      const template = getSalesTemplate(form.template_id)
      const baseSlug = slugify(form.name)
      const slug = `${baseSlug}-${Date.now().toString(36)}`

      const { data, error } = await supabase.from('flows').insert({
        user_id: userId,
        name: form.name.trim(),
        slug,
        product_id: form.product_id || null,
        status: 'draft',
        version: 1,
      }).select('*').single()
      if (error) throw error

      const generated = buildSalesTemplateFlow({
        templateId: form.template_id,
        userId,
        flowId: data.id,
        productId: form.product_id || null,
        deliveryType: (form.delivery_type || template.suggestedDeliveryType) as any,
        visualTemplate: form.visual_template,
        supportWhatsapp: form.support_whatsapp.trim() || '{{system.support_whatsapp}}',
        gateway: form.gateway,
      })

      const { error: nodesError } = await supabase.from('flow_nodes').insert(generated.nodes)
      if (nodesError) throw nodesError
      const { error: edgesError } = await supabase.from('flow_edges').insert(generated.edges)
      if (edgesError) throw edgesError

      const startNode = generated.nodes.find(node => node.type === 'start')
      if (startNode) {
        const { error: startError } = await supabase
          .from('flows')
          .update({ start_node_id: startNode.id, updated_at: new Date().toISOString() })
          .eq('id', data.id)
          .eq('user_id', userId)
        if (startError) throw startError
      }

      const product = products.find(p => p.id === data.product_id)
      setFlows(prev => [{
        ...data,
        start_node_id: startNode?.id || data.start_node_id,
        product: product ? { name: product.name } : null,
      }, ...prev])
      setShowCreate(false)
      resetForm()
      router.refresh()
      toast.success('Template montado! Abrindo editor...')
      router.push(`/admin/flows/${data.id}`)
    } catch (err: unknown) {
      console.error('[flows] erro ao criar fluxo', err)
      const message = err instanceof Error ? err.message : ''
      const friendlyMessage = message.includes('slug') ? 'Esse slug ja esta em uso' : `Erro ao montar fluxo${message ? `: ${message}` : ''}`
      setFormError(friendlyMessage)
      toast.error(friendlyMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteFlow) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('flows').delete().eq('id', deleteFlow.id).eq('user_id', userId)
      if (error) throw error
      setFlows(prev => prev.filter(f => f.id !== deleteFlow.id))
      toast.success('Fluxo removido')
      setDeleteFlow(null)
    } catch {
      toast.error('Erro ao remover')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[1.375rem] font-extrabold text-[#081827] tracking-tight">Fluxos</h1>
          <p className="text-[0.8rem] text-[#71869B] mt-1">{flows.length} fluxo(s) criado(s)</p>
        </div>
        <Button onClick={() => { setFormError(null); setShowCreate(true) }} size="md">
          <Plus size={15} />
          Novo Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Workflow size={24} />}
            title="Nenhum fluxo criado"
            description="Escolha um template de venda X1 e o Chatfy monta a conversa, Pix e entrega para voce editar."
            action={
              <Button onClick={() => { setFormError(null); setShowCreate(true) }} size="sm">
                <Plus size={14} />
                Criar primeiro fluxo
              </Button>
            }
          />
        </Card>
      ) : (
      <div className="grid gap-3">
        {flows.map(flow => (
          <Card key={flow.id} hover>
            <div className="flex items-center gap-4">
              <div className="w-[44px] h-[44px] rounded-[12px] shrink-0 bg-[rgba(11,124,255,0.08)] flex items-center justify-center">
                <Workflow size={20} className="text-[#0B7CFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-[0.2rem]">
                  <span className="text-sm font-bold text-[#081827]">{flow.name}</span>
                  <Badge status={flow.status} />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {flow.product && <span className="text-xs text-[#71869B]">Produto: {flow.product.name}</span>}
                  <span className="text-xs text-[#71869B] font-semibold">v{flow.version}</span>
                  <span className="text-xs text-[#71869B]">{formatDate(flow.updated_at)}</span>
                </div>
                <FlowFunnelStrip funnel={funnelByFlow[flow.id]} />
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/flows/${flow.id}`} className="no-underline">
                  <Button variant="secondary" size="sm">
                    <Edit size={14} />
                    Editar
                  </Button>
                </Link>
                <button
                  onClick={() => setDeleteFlow(flow)}
                  title="Excluir"
                  className="p-2 rounded-[8px] bg-transparent border-none text-[#71869B] cursor-pointer flex transition-all duration-150 hover:bg-[rgba(239,68,68,0.1)] hover:text-[#F87171]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Novo fluxo de venda X1" size="lg" footer={
    <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setShowCreate(false)} fullWidth>Cancelar</Button>
        <Button onClick={handleCreate} isLoading={creating} fullWidth>Montar fluxo</Button>
      </div>
      }>
    <div className="flex flex-col gap-4">
        {formError && (
          <div role="alert" aria-live="polite" className="px-[0.875rem] py-3 rounded-[10px] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.12)] text-[#FCA5A5] text-[0.78rem] leading-relaxed">
            {formError}
          </div>
        )}
          <Input
            label="Nome do fluxo"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Venda X1 - Produto principal"
            required
          />

          <div>
        <label className="block mb-2 text-[#081827] text-[0.78rem] font-bold">
          Template pronto
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[0.65rem]">
          {salesTemplates.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => setForm(f => ({ ...f, template_id: template.id, delivery_type: f.delivery_type || template.suggestedDeliveryType }))}
              className={`p-[0.9rem] rounded-[14px] text-left cursor-pointer ${
                form.template_id === template.id
                  ? 'border border-[rgba(11,124,255,0.75)] bg-[rgba(11,124,255,0.12)]'
                  : 'border border-[rgba(8,24,39,0.08)] bg-white'
              }`}
            >
              <strong className="block text-[#081827] text-[0.82rem] mb-1">{template.name}</strong>
              <span className="block text-[#71869B] text-xs leading-relaxed">{template.description}</span>
            </button>
          ))}
        </div>
          </div>

          {products.length > 0 && (
            <Select
              label="Produto vinculado"
              value={form.product_id}
              onChange={value => setForm(f => ({ ...f, product_id: value }))}
              hint="O template usa {{product.name}}, {{product.price}} e configura o Pix com esse produto."
              options={[
                { value: '', label: 'Nenhum produto' },
                ...products.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
          )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Select
          label="Template visual"
              value={form.visual_template}
              onChange={value => setForm(f => ({ ...f, visual_template: value }))}
              options={[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'instagram', label: 'Instagram' }
              ]}
            />
            <Select
              label="Tipo de entrega"
              value={form.delivery_type || getSalesTemplate(form.template_id).suggestedDeliveryType}
              onChange={value => setForm(f => ({ ...f, delivery_type: value }))}
              options={[
                { value: 'account_credentials', label: 'Conta com login e senha' },
                { value: 'digital_file', label: 'Arquivo/material digital' },
                { value: 'community_link', label: 'Link de comunidade' },
                { value: 'course', label: 'Curso' },
                { value: 'external_link', label: 'Link externo' },
                { value: 'custom_message', label: 'Mensagem personalizada' },
                { value: 'manual_access', label: 'Entrega manual/agendamento' }
              ]}
            />
          </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Input
          label="Suporte"
              value={form.support_whatsapp}
              onChange={e => setForm(f => ({ ...f, support_whatsapp: e.target.value }))}
              placeholder="{{system.support_whatsapp}}"
            />
            <Select
              label="Gateway"
              value={form.gateway}
              onChange={value => setForm(f => ({ ...f, gateway: value }))}
              options={[
                { value: 'default', label: 'Gateway padrao' },
                { value: 'pix', label: 'Pix' }
              ]}
            />
          </div>

      <div className="border border-[rgba(34,211,238,0.22)] bg-[rgba(34,211,238,0.06)] text-[#71869B] rounded-[14px] p-[0.85rem] text-[0.76rem] leading-relaxed">
        O Chatfy vai montar automaticamente: boas-vindas, dor, solucao, oferta, captura por conversa, Pix, aguardar pagamento, entrega, suporte e fim. Tudo fica editavel no React Flow.
      </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteFlow}
        onClose={() => setDeleteFlow(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Excluir fluxo"
        description={`Tem certeza que deseja excluir "${deleteFlow?.name}"? Todas as conexoes e configuracoes serao permanentemente removidas.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}

function FlowFunnelStrip({ funnel }: { funnel?: FlowFunnel }) {
  const data = funnel || { entered: 0, replied: 0, priceViewed: 0, pixGenerated: 0, paid: 0, delivered: 0 }
  const items = [
    ['Entrou', data.entered],
    ['Respondeu', data.replied],
    ['Viu preco', data.priceViewed],
    ['Pix', data.pixGenerated],
    ['Pagou', data.paid],
    ['Entrega', data.delivered],
  ]

  return (
    <div className="flex gap-[0.4rem] flex-wrap mt-[0.65rem]">
      <span className="inline-flex items-center gap-[0.3rem] text-[#71869B] text-[0.68rem] font-bold">
        <BarChart3 size={12} />
        Funil
      </span>
      {items.map(([label, value]) => (
        <span key={label} className="border border-[rgba(8,24,39,0.08)] rounded-full py-[0.2rem] px-[0.48rem] text-[#71869B] text-[0.68rem] bg-[rgba(8,24,39,0.03)]">
          {label}: <strong className="text-[#081827]">{value}</strong>
        </span>
      ))}
    </div>
  )
}
