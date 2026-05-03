'use client'

import { Node } from 'reactflow'
import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { Toast, useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { Trash2, X, Plus, Upload } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface NodeEditorPanelProps {
  node: Node
  products: { id: string; name: string; price: number }[]
  userId: string
  flowId: string
  onChange: (data: Partial<Node['data']>) => void
  onDelete: () => void
}

export function NodeEditorPanel({ node, products, userId, flowId, onChange, onDelete }: NodeEditorPanelProps) {
  const toast = useToast()
  const nodeType = node.data.nodeType || node.data.type
  const config = node.data.config || {}

  const updateConfig = (updates: Record<string, unknown>) => {
    onChange({ config: { ...config, ...updates } })
  }

  const updateTitle = (title: string) => onChange({ title })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Editar Nó</h3>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <Input
        label="Título do nó"
        value={node.data.title || ''}
        onChange={e => updateTitle(e.target.value)}
        placeholder="Nome interno"
      />

      {/* Node type specific fields */}
      {(nodeType === 'text_message' || nodeType === 'message' || nodeType === 'button_message' || nodeType === 'quick_reply' || nodeType === 'media_gallery' || nodeType === 'product_plan' || nodeType === 'objection' || nodeType === 'social_proof') && (
        <TextMessageEditor config={config} onChange={updateConfig} />
      )}

      {(nodeType === 'button_message' || nodeType === 'quick_reply') && (
        <ButtonsEditor config={config} onChange={updateConfig} />
      )}

      {(nodeType === 'input' || nodeType === 'capture_input') && (
        <InputEditor config={config} onChange={updateConfig} />
      )}

      {['media_message', 'audio_message', 'video_message', 'image_message', 'file_message'].includes(nodeType) && (
        <MediaNodeEditor
          nodeId={node.id}
          flowId={flowId}
          userId={userId}
          config={config}
          onChange={updateConfig}
          toast={toast}
        />
      )}

      {nodeType === 'media_gallery' && (
        <MediaGalleryEditor
          nodeId={node.id}
          flowId={flowId}
          userId={userId}
          config={config}
          onChange={updateConfig}
          toast={toast}
        />
      )}

      {nodeType === 'product_plan' && (
        <ProductPlanEditor config={config} onChange={updateConfig} products={products} />
      )}

      {nodeType === 'checkout' && (
        <CheckoutEditor config={config} onChange={updateConfig} products={products} />
      )}

      {(nodeType === 'pix_payment' || nodeType === 'payment') && (
        <PixPaymentEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'wait_payment' && (
        <WaitPaymentEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'delivery' && (
        <AdvancedDeliveryEditor config={config} onChange={updateConfig} products={products} />
      )}

      {nodeType === 'delay' && (
        <Input
          label="Tempo de espera (ms)"
          type="number"
          value={String(config.delay_ms || 900)}
          onChange={e => updateConfig({ delay_ms: parseInt(e.target.value) || 0 })}
        />
      )}

      {nodeType === 'objection' && (
        <ObjectionEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'social_proof' && (
        <ButtonsEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'update_lead' && (
        <UpdateLeadEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'notification' && (
        <NotificationEditor config={config} onChange={updateConfig} />
      )}

      {(nodeType === 'end' || nodeType === 'error_fallback') && (
        <EndEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'redirect' && (
        <div>
          <Input
            label="URL de redirecionamento"
            value={String(config.url || '')}
            onChange={e => updateConfig({ url: e.target.value })}
            placeholder="https://..."
          />
          <div className="mt-2">
            <Input
              label="Delay (ms)"
              type="number"
              value={String(config.delay_ms || 0)}
              onChange={e => updateConfig({ delay_ms: parseInt(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function TextMessageEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Mensagem"
        value={config.message_text || ''}
        onChange={e => onChange({ message_text: e.target.value })}
        placeholder="Digite a mensagem..."
        rows={4}
        hint="Use {{variavel}} para inserir dados do usuário"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">Delay inicial (ms)</label>
          <input
            type="number"
            value={config.delay_ms || 0}
            onChange={e => onChange({ delay_ms: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/60"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">Digitação (ms)</label>
          <input
            type="number"
            value={config.typing_duration_ms || 1500}
            onChange={e => onChange({ typing_duration_ms: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/60"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={config.show_typing || false}
          onChange={e => onChange({ show_typing: e.target.checked })}
          className="w-4 h-4 accent-violet-500 rounded"
        />
        Mostrar "digitando..."
      </label>
    </div>
  )
}

function ButtonsEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  const buttons = config.buttons || []

  const addButton = () => {
    onChange({
      buttons: [...buttons, { id: uuidv4(), label: 'Opção', action_type: 'go_to_node', target_node_id: null }]
    })
  }

  const updateButton = (idx: number, updates: any) => {
    const updated = buttons.map((b: any, i: number) => i === idx ? { ...b, ...updates } : b)
    onChange({ buttons: updated })
  }

  const removeButton = (idx: number) => {
    onChange({ buttons: buttons.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-300">Botões ({buttons.length})</p>
      {buttons.map((btn: any, idx: number) => (
        <div key={btn.id} className="p-3 rounded-xl bg-white/3 border border-white/8 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={btn.label}
              onChange={e => updateButton(idx, { label: e.target.value })}
              placeholder="Texto do botão"
              className="flex-1 px-2.5 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none"
            />
            <button onClick={() => removeButton(idx)} className="p-1 hover:text-red-400 text-slate-500">
              <X size={14} />
            </button>
          </div>
          <select
            value={btn.action_type}
            onChange={e => updateButton(idx, { action_type: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-[#111118] border border-white/10 text-white focus:outline-none"
          >
            <option value="go_to_node">Ir para nó</option>
            <option value="open_checkout">Abrir checkout</option>
            <option value="open_support">Abrir suporte</option>
            <option value="external_link">Link externo</option>
            <option value="restart_flow">Reiniciar fluxo</option>
          </select>
          {btn.action_type === 'external_link' && (
            <input
              value={btn.external_url || ''}
              onChange={e => updateButton(idx, { external_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white focus:outline-none"
            />
          )}
        </div>
      ))}
      <button
        onClick={addButton}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/15 text-xs text-slate-500 hover:text-violet-400 hover:border-violet-500/40 transition-all"
      >
        <Plus size={13} />
        Adicionar botão
      </button>
    </div>
  )
}

function InputEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Input
        label="Pergunta / Label"
        value={config.label || ''}
        onChange={e => onChange({ label: e.target.value })}
        placeholder="Qual é o seu nome?"
      />
      <Input
        label="Placeholder"
        value={config.placeholder || ''}
        onChange={e => onChange({ placeholder: e.target.value })}
        placeholder="Digite aqui..."
      />
      <Input
        label="Variável (para usar depois)"
        value={config.variable_name || ''}
        onChange={e => onChange({ variable_name: e.target.value })}
        placeholder="customer_name"
      />
      <Select
        label="Tipo de input"
        value={config.input_type || 'text'}
        onChange={value => onChange({ input_type: value })}
        options={[
          { value: 'text', label: 'Texto' },
          { value: 'email', label: 'E-mail' },
          { value: 'phone', label: 'Telefone' },
          { value: 'number', label: 'Número' },
        ]}
      />
    </div>
  )
}

const mediaAccept: Record<string, string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/webm',
  audio: 'audio/mpeg,audio/mp4,audio/ogg,audio/wav',
  document: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  file: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function mediaTypeFromNode(nodeMediaType: string | undefined) {
  return nodeMediaType === 'file' ? 'document' : (nodeMediaType || 'image')
}

function MediaNodeEditor({
  nodeId,
  flowId,
  userId,
  config,
  onChange,
  toast,
}: {
  nodeId: string
  flowId: string
  userId: string
  config: any
  onChange: (u: any) => void
  toast: ReturnType<typeof useToast>
}) {
  const [uploading, setUploading] = useState(false)
  const mediaType = mediaTypeFromNode(config.media_type)

  const uploadFile = async (file: File) => {
    const allowed = mediaAccept[mediaType] || mediaAccept.image
    if (!allowed.split(',').includes(file.type)) {
      toast.error('Tipo de arquivo nao suportado para este no')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Arquivo acima do limite de 50MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase()
      const path = `${userId}/${flowId}/${nodeId}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('chatfy-media').upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('chatfy-media').getPublicUrl(path)
      const publicUrl = data.publicUrl

      const { data: asset, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          user_id: userId,
          flow_id: flowId,
          node_id: nodeId,
          type: mediaType,
          file_name: file.name,
          file_url: publicUrl,
          mime_type: file.type,
          size: file.size,
          metadata: { storage_path: path },
        })
        .select('id')
        .single()
      if (assetError) throw assetError

      onChange({
        media_type: mediaType,
        media_url: publicUrl,
        media_asset_id: asset?.id,
        file_name: file.name,
        mime_type: file.type,
        size: file.size,
      })
      toast.success('Midia enviada para o fluxo')
    } catch (err) {
      console.error(err)
      toast.error('Nao consegui enviar a midia')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Select
        label="Tipo de midia"
        value={mediaType}
        onChange={value => onChange({ media_type: value })}
        options={[
          { value: 'image', label: 'Imagem' },
          { value: 'video', label: 'Video' },
          { value: 'audio', label: 'Audio' },
          { value: 'document', label: 'PDF / documento' },
        ]}
      />

      <Input
        label="URL externa ou arquivo enviado"
        value={config.media_url || ''}
        onChange={e => onChange({ media_url: e.target.value })}
        placeholder="https://..."
      />

      <label className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-4 text-center text-xs text-slate-400 hover:border-violet-400/50 hover:text-white">
        <Upload size={18} />
        {uploading ? 'Enviando...' : 'Clique para enviar arquivo'}
        <input
          type="file"
          className="hidden"
          accept={mediaAccept[mediaType]}
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.currentTarget.value = ''
          }}
        />
      </label>

      {mediaType === 'video' && (
        <Input
          label="Thumbnail do video"
          value={config.thumbnail_url || ''}
          onChange={e => onChange({ thumbnail_url: e.target.value })}
          placeholder="https://..."
        />
      )}

      <Textarea
        label="Legenda"
        value={config.caption || ''}
        onChange={e => onChange({ caption: e.target.value })}
        rows={3}
      />
    </div>
  )
}

function MediaGalleryEditor(props: {
  nodeId: string
  flowId: string
  userId: string
  config: any
  onChange: (u: any) => void
  toast: ReturnType<typeof useToast>
}) {
  const items = Array.isArray(props.config.media_items) ? props.config.media_items : []

  const addItem = () => {
    props.onChange({
      media_items: [...items, { id: uuidv4(), type: 'image', url: '', caption: '' }],
    })
  }

  const updateItem = (idx: number, updates: any) => {
    props.onChange({
      media_items: items.map((item: any, i: number) => i === idx ? { ...item, ...updates } : item),
    })
  }

  const removeItem = (idx: number) => {
    props.onChange({ media_items: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-slate-300">Midias da sequencia</p>
      {items.map((item: any, idx: number) => (
        <div key={item.id} className="space-y-2 rounded-xl border border-white/8 bg-white/3 p-3">
          <div className="flex items-center gap-2">
            <select
              value={item.type || 'image'}
              onChange={e => updateItem(idx, { type: e.target.value })}
              className="w-28 rounded-lg border border-white/10 bg-[#111118] px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="image">Imagem</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">PDF</option>
            </select>
            <button onClick={() => removeItem(idx)} className="ml-auto p-1 text-slate-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
          <input
            value={item.url || ''}
            onChange={e => updateItem(idx, { url: e.target.value })}
            placeholder="URL da midia"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
          />
          <input
            value={item.caption || ''}
            onChange={e => updateItem(idx, { caption: e.target.value })}
            placeholder="Legenda opcional"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2 text-xs text-slate-500 transition-all hover:border-violet-500/40 hover:text-violet-400"
      >
        <Plus size={13} />
        Adicionar midia
      </button>
    </div>
  )
}

function ProductPlanEditor({ config, onChange, products }: { config: any; onChange: (u: any) => void; products: any[] }) {
  const plans = Array.isArray(config.plans) ? config.plans : []

  const syncButtons = (nextPlans: any[]) => nextPlans.map(plan => ({
    id: plan.id,
    label: plan.button_text || plan.label || plan.plan_name || 'Escolher plano',
    action_type: 'go_to_node',
  }))

  const updatePlans = (nextPlans: any[]) => onChange({ plans: nextPlans, buttons: syncButtons(nextPlans) })

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-300">Planos/produtos da oferta</p>
      {plans.map((plan: any, idx: number) => (
        <div key={plan.id} className="space-y-2 rounded-xl border border-white/8 bg-white/3 p-3">
          <Input label="Nome do plano" value={plan.plan_name || ''} onChange={e => updatePlans(plans.map((p: any, i: number) => i === idx ? { ...p, plan_name: e.target.value, label: e.target.value } : p))} />
          <Select label="Produto vinculado" value={plan.product_id || ''} onChange={value => updatePlans(plans.map((p: any, i: number) => i === idx ? { ...p, product_id: value } : p))} options={[{ value: '', label: 'Sem produto vinculado' }, ...products.map(p => ({ value: p.id, label: p.name }))]} />
          <Input label="Preco" type="number" value={String(plan.price || '')} onChange={e => updatePlans(plans.map((p: any, i: number) => i === idx ? { ...p, price: Number(e.target.value) } : p))} />
          <Input label="Texto do botao" value={plan.button_text || ''} onChange={e => updatePlans(plans.map((p: any, i: number) => i === idx ? { ...p, button_text: e.target.value } : p))} />
          <button onClick={() => updatePlans(plans.filter((_: any, i: number) => i !== idx))} className="text-xs text-red-400">Remover plano</button>
        </div>
      ))}
      <button onClick={() => updatePlans([...plans, { id: uuidv4(), plan_name: 'Plano completo', button_text: 'Quero esse' }])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2 text-xs text-slate-500 hover:text-violet-400">
        <Plus size={13} />
        Adicionar plano
      </button>
    </div>
  )
}

function CheckoutEditor({ config, onChange, products }: { config: any; onChange: (u: any) => void; products: any[] }) {
  return (
    <div className="space-y-3">
      {products.length > 0 && (
        <Select
          label="Produto"
          value={config.product_id || ''}
          onChange={value => onChange({ product_id: value })}
          options={[
            { value: '', label: 'Usar produto da página' },
            ...products.map(p => ({ value: p.id, label: p.name }))
          ]}
        />
      )}
      <Input
        label="Título"
        value={config.summary_title || ''}
        onChange={e => onChange({ summary_title: e.target.value })}
        placeholder="Confirme seus dados"
      />
      <Input
        label="Texto do botão"
        value={config.button_text || ''}
        onChange={e => onChange({ button_text: e.target.value })}
        placeholder="Continuar para pagamento"
      />
    </div>
  )
}

function PixPaymentEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Input
        label="Texto pendente"
        value={config.pending_text || ''}
        onChange={e => onChange({ pending_text: e.target.value })}
        placeholder="Escaneie o QR Code ou copie o código"
      />
      <Input
        label="Texto botão copiar"
        value={config.copy_button_text || ''}
        onChange={e => onChange({ copy_button_text: e.target.value })}
        placeholder="📋 Copiar código Pix"
      />
      <Input
        label="Expiração (minutos)"
        type="number"
        value={config.expiration_minutes || 30}
        onChange={e => onChange({ expiration_minutes: parseInt(e.target.value) })}
      />
    </div>
  )
}

function WaitPaymentEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Input
        label="Intervalo de verificação (segundos)"
        type="number"
        value={config.polling_interval_seconds || 5}
        onChange={e => onChange({ polling_interval_seconds: parseInt(e.target.value) })}
      />
      <Input
        label="Timeout (minutos)"
        type="number"
        value={config.timeout_minutes || 30}
        onChange={e => onChange({ timeout_minutes: parseInt(e.target.value) })}
      />
    </div>
  )
}

function DeliveryEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Template de entrega"
        value={config.delivery_template || ''}
        onChange={e => onChange({ delivery_template: e.target.value })}
        placeholder="Aqui está seu acesso, {{customer_name}}! 🎉"
        rows={4}
        hint="Vars: {{customer_name}}, {{access_email}}, {{access_password}}, {{access_url}}, {{license_key}}, {{custom_content}}"
      />
      <Input
        label="Texto botão suporte"
        value={config.support_button_text || ''}
        onChange={e => onChange({ support_button_text: e.target.value })}
        placeholder="Preciso de ajuda"
      />
    </div>
  )
}

const deliveryTypes = [
  { value: 'account_credentials', label: 'Conta com login e senha' },
  { value: 'community_link', label: 'Link de comunidade' },
  { value: 'exclusive_content', label: 'Conteúdo exclusivo' },
  { value: 'course', label: 'Curso' },
  { value: 'digital_file', label: 'Arquivo ou material digital' },
  { value: 'custom_message', label: 'Mensagem personalizada' },
  { value: 'external_link', label: 'Link externo' },
  { value: 'manual_access', label: 'Acesso manual / instruções' },
]

const deliveryVariables = [
  '{{lead.name}}',
  '{{lead.email}}',
  '{{lead.phone}}',
  '{{product.name}}',
  '{{product.price}}',
  '{{order.id}}',
  '{{order.amount}}',
  '{{payment.status}}',
  '{{account.login}}',
  '{{account.password}}',
  '{{account.email}}',
  '{{account.extra_info}}',
  '{{delivery.link}}',
  '{{delivery.button_text}}',
]

function AdvancedDeliveryEditor({ config, onChange, products }: { config: any; onChange: (u: any) => void; products: any[] }) {
  const deliveryType = config.delivery_type || 'account_credentials'
  const defaultTemplate = deliveryType === 'account_credentials'
    ? 'Pagamento aprovado ✅\n\nAqui está seu acesso:\n\nLogin: {{account.login}}\nSenha: {{account.password}}\n\nGuarde esses dados com segurança.'
    : deliveryType === 'manual_access'
      ? 'Pagamento aprovado ✅\n\nObrigado pela compra, {{lead.name}}. Nossa equipe vai liberar seu acesso em instantes.'
      : 'Pagamento aprovado ✅\n\nSeu acesso foi liberado.\n\nAcesse por aqui: {{delivery.link}}'

  return (
    <div className="space-y-4">
      <Select label="Tipo de entrega" value={deliveryType} onChange={value => onChange({ delivery_type: value })} options={deliveryTypes} />

      <Select
        label={deliveryType === 'account_credentials' ? 'Produto/estoque vinculado' : 'Produto vinculado'}
        value={config.inventory_product_id || config.product_id || ''}
        onChange={value => onChange({ inventory_product_id: value, product_id: value })}
        hint={deliveryType === 'account_credentials' ? 'A conta será puxada dos itens disponíveis deste produto.' : 'Usado para variáveis e registro da entrega.'}
        options={[
          { value: '', label: 'Usar produto da página/pedido' },
          ...products.map(p => ({ value: p.id, label: p.name }))
        ]}
      />

      {deliveryType === 'account_credentials' && (
        <>
          <Select label="Status da conta após entrega" value={config.inventory_status_after_delivery || 'delivered'} onChange={value => onChange({ inventory_status_after_delivery: value })} options={[
            { value: 'sold', label: 'sold' },
            { value: 'delivered', label: 'delivered' },
            { value: 'used', label: 'used' },
          ]} />
          <Textarea label="Mensagem caso não tenha estoque" value={config.out_of_stock_message || ''} onChange={e => onChange({ out_of_stock_message: e.target.value })} rows={3} />
        </>
      )}

      {deliveryType === 'community_link' && (
        <>
          <Input label="Nome da comunidade" value={config.community_name || ''} onChange={e => onChange({ community_name: e.target.value })} />
          <Input label="Link da comunidade" value={config.community_link || ''} onChange={e => onChange({ community_link: e.target.value })} placeholder="https://..." />
          <Input label="Texto do botão" value={config.button_text || ''} onChange={e => onChange({ button_text: e.target.value })} placeholder="Entrar na comunidade" />
        </>
      )}

      {deliveryType === 'exclusive_content' && (
        <>
          <Input label="Título do conteúdo" value={config.content_title || ''} onChange={e => onChange({ content_title: e.target.value })} />
          <Input label="Link de acesso" value={config.access_link || ''} onChange={e => onChange({ access_link: e.target.value })} placeholder="https://..." />
          <Input label="Texto do botão" value={config.button_text || ''} onChange={e => onChange({ button_text: e.target.value })} placeholder="Acessar conteúdo" />
          <Textarea label="Descrição" value={config.content_description || ''} onChange={e => onChange({ content_description: e.target.value })} rows={2} />
        </>
      )}

      {deliveryType === 'course' && (
        <>
          <Input label="Nome do curso" value={config.course_name || ''} onChange={e => onChange({ course_name: e.target.value })} />
          <Input label="Plataforma" value={config.platform || ''} onChange={e => onChange({ platform: e.target.value })} />
          <Input label="Link de acesso" value={config.access_link || ''} onChange={e => onChange({ access_link: e.target.value })} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Login" value={config.login || ''} onChange={e => onChange({ login: e.target.value })} />
            <Input label="Senha" value={config.password || ''} onChange={e => onChange({ password: e.target.value })} />
          </div>
          <Textarea label="Instruções de primeiro acesso" value={config.additional_instructions || ''} onChange={e => onChange({ additional_instructions: e.target.value })} rows={2} />
        </>
      )}

      {deliveryType === 'digital_file' && (
        <>
          <Input label="Nome do material" value={config.material_name || ''} onChange={e => onChange({ material_name: e.target.value })} />
          <Input label="Link do arquivo" value={config.file_link || ''} onChange={e => onChange({ file_link: e.target.value })} placeholder="https://..." />
          <Input label="Texto do botão" value={config.button_text || ''} onChange={e => onChange({ button_text: e.target.value })} placeholder="Baixar material" />
          <Textarea label="Observações" value={config.additional_instructions || ''} onChange={e => onChange({ additional_instructions: e.target.value })} rows={2} />
        </>
      )}

      {deliveryType === 'external_link' && (
        <>
          <Input label="URL" value={config.external_url || ''} onChange={e => onChange({ external_url: e.target.value })} placeholder="https://..." />
          <Input label="Texto do botão" value={config.button_text || ''} onChange={e => onChange({ button_text: e.target.value })} placeholder="Acessar agora" />
        </>
      )}

      {deliveryType === 'manual_access' && (
        <>
          <Input label="Prazo de liberação" value={config.release_deadline || ''} onChange={e => onChange({ release_deadline: e.target.value })} placeholder="Ex: até 15 minutos" />
          <Input label="Contato de suporte" value={config.support_contact || ''} onChange={e => onChange({ support_contact: e.target.value })} placeholder="WhatsApp ou e-mail" />
        </>
      )}

      <Textarea
        label="Mensagem de entrega"
        value={config.delivery_template || defaultTemplate}
        onChange={e => onChange({ delivery_template: e.target.value })}
        rows={6}
        hint="Use as variáveis abaixo para personalizar a mensagem."
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <p className="mb-2 text-xs font-semibold text-slate-300">Variáveis disponíveis</p>
        <div className="flex flex-wrap gap-1.5">
          {deliveryVariables.map(variable => (
            <button
              key={variable}
              type="button"
              onClick={() => navigator.clipboard?.writeText(variable)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-slate-300 hover:border-violet-400/50 hover:text-white"
              title="Clique para copiar"
            >
              {variable}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs leading-relaxed text-slate-300">
        Conecte as saídas do nó no canvas: <strong>Sucesso</strong>, <strong>Sem estoque</strong> e <strong>Erro</strong>.
      </div>
    </div>
  )
}

function ObjectionEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  const objections = Array.isArray(config.objections) ? config.objections : []

  const updateObjections = (next: any[]) => onChange({ objections: next })

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-300">Objecoes comuns</p>
      {objections.map((item: any, idx: number) => (
        <div key={item.id} className="space-y-2 rounded-xl border border-white/8 bg-white/3 p-3">
          <div className="flex items-center gap-2">
            <input
              value={item.label || ''}
              onChange={e => updateObjections(objections.map((o: any, i: number) => i === idx ? { ...o, label: e.target.value } : o))}
              placeholder="Ex: Esta caro"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white focus:outline-none"
            />
            <button onClick={() => updateObjections(objections.filter((_: any, i: number) => i !== idx))} className="p-1 text-slate-500 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
          <Textarea
            label="Resposta automatica"
            value={item.response || ''}
            onChange={e => updateObjections(objections.map((o: any, i: number) => i === idx ? { ...o, response: e.target.value } : o))}
            rows={3}
          />
        </div>
      ))}
      <button
        onClick={() => updateObjections([...objections, { id: uuidv4(), label: 'Esta caro', response: 'Entendo. Posso te mostrar por que muita gente escolhe mesmo assim?' }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2 text-xs text-slate-500 hover:text-violet-400"
      >
        <Plus size={13} />
        Adicionar objecao
      </button>
    </div>
  )
}

function UpdateLeadEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Input
        label="Campo/variavel"
        value={config.update_field || ''}
        onChange={e => onChange({ update_field: e.target.value })}
        placeholder="lead.stage"
      />
      <Input
        label="Valor"
        value={config.update_value || ''}
        onChange={e => onChange({ update_value: e.target.value })}
        placeholder="lead_quente"
      />
    </div>
  )
}

function NotificationEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Select
        label="Canal"
        value={config.notification_channel || 'internal'}
        onChange={value => onChange({ notification_channel: value })}
        options={[
          { value: 'internal', label: 'Interno' },
          { value: 'webhook', label: 'Webhook' },
          { value: 'email', label: 'E-mail' },
        ]}
      />
      <Textarea
        label="Mensagem"
        value={config.notification_message || ''}
        onChange={e => onChange({ notification_message: e.target.value })}
        rows={3}
      />
      {config.notification_channel === 'webhook' && (
        <Input
          label="Webhook URL"
          value={config.url || ''}
          onChange={e => onChange({ url: e.target.value })}
          placeholder="https://..."
        />
      )}
    </div>
  )
}

function EndEditor({ config, onChange }: { config: any; onChange: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <Textarea
        label="Mensagem final"
        value={config.final_message || ''}
        onChange={e => onChange({ final_message: e.target.value })}
        placeholder="Obrigado! Até logo! 👋"
        rows={3}
      />
      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={config.restart_button || false}
          onChange={e => onChange({ restart_button: e.target.checked })}
          className="w-4 h-4 accent-violet-500 rounded"
        />
        Mostrar botão de reiniciar
      </label>
    </div>
  )
}
