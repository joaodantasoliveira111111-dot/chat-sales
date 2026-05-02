'use client'

import { Node } from 'reactflow'
import { useState } from 'react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Trash2, X, Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface NodeEditorPanelProps {
  node: Node
  products: { id: string; name: string; price: number }[]
  onChange: (data: Partial<Node['data']>) => void
  onDelete: () => void
}

export function NodeEditorPanel({ node, products, onChange, onDelete }: NodeEditorPanelProps) {
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
      {(nodeType === 'text_message' || nodeType === 'button_message') && (
        <TextMessageEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'button_message' && (
        <ButtonsEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'input' && (
        <InputEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'checkout' && (
        <CheckoutEditor config={config} onChange={updateConfig} products={products} />
      )}

      {nodeType === 'pix_payment' && (
        <PixPaymentEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'wait_payment' && (
        <WaitPaymentEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'delivery' && (
        <DeliveryEditor config={config} onChange={updateConfig} />
      )}

      {nodeType === 'end' && (
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
        onChange={e => onChange({ input_type: e.target.value })}
      >
        <option value="text">Texto</option>
        <option value="email">E-mail</option>
        <option value="phone">Telefone</option>
        <option value="number">Número</option>
      </Select>
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
          onChange={e => onChange({ product_id: e.target.value })}
        >
          <option value="">Usar produto da página</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
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
