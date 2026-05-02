'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import { NodeType } from '@/types'
import {
  Play, MessageSquare, LayoutList, Image, AlignJustify,
  GitBranch, HelpCircle, ShoppingCart, Wallet, Clock,
  Package, Headphones, Zap, ArrowRight, Square,
} from 'lucide-react'

const nodeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  start: { icon: Play, color: '#10B981', label: 'Início' },
  text_message: { icon: MessageSquare, color: '#8B5CF6', label: 'Mensagem' },
  button_message: { icon: LayoutList, color: '#8B5CF6', label: 'Botões' },
  media_message: { icon: Image, color: '#06B6D4', label: 'Mídia' },
  input: { icon: AlignJustify, color: '#F59E0B', label: 'Entrada' },
  condition: { icon: GitBranch, color: '#F97316', label: 'Condição' },
  faq: { icon: HelpCircle, color: '#06B6D4', label: 'FAQ' },
  checkout: { icon: ShoppingCart, color: '#8B5CF6', label: 'Checkout' },
  pix_payment: { icon: Wallet, color: '#10B981', label: 'Pagamento Pix' },
  wait_payment: { icon: Clock, color: '#F59E0B', label: 'Aguardar Pag.' },
  delivery: { icon: Package, color: '#06B6D4', label: 'Entrega' },
  support: { icon: Headphones, color: '#8B5CF6', label: 'Suporte' },
  action: { icon: Zap, color: '#F97316', label: 'Ação' },
  redirect: { icon: ArrowRight, color: '#94A3B8', label: 'Redirecionar' },
  end: { icon: Square, color: '#EF4444', label: 'Fim' },
}

export function CustomNode({ data, selected }: NodeProps) {
  const nodeType = data.nodeType || data.type || 'text_message'
  const config = nodeConfig[nodeType] || nodeConfig.text_message
  const Icon = config.icon

  const preview = data.config?.message_text || data.config?.label || data.title || config.label

  return (
    <div
      className="relative rounded-2xl border transition-all duration-200 min-w-[180px] max-w-[240px]"
      style={{
        background: 'rgba(17,17,24,0.95)',
        borderColor: selected ? config.color : 'rgba(255,255,255,0.1)',
        boxShadow: selected ? `0 0 0 2px ${config.color}40` : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Target handle (top) */}
      {nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: config.color, border: 'none', width: 10, height: 10 }}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-t-2xl"
        style={{ background: `${config.color}15`, borderBottom: `1px solid ${config.color}25` }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${config.color}25`, color: config.color }}
        >
          <Icon size={12} />
        </div>
        <p className="text-xs font-semibold text-white">{config.label}</p>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-slate-400 line-clamp-2">
          {String(preview || '').slice(0, 60) || '...'}
        </p>
        {data.config?.buttons && Array.isArray(data.config.buttons) && data.config.buttons.length > 0 && (
          <p className="text-xs text-slate-600 mt-1">{data.config.buttons.length} botão(ões)</p>
        )}
      </div>

      {/* Source handle (bottom) */}
      {nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: config.color, border: 'none', width: 10, height: 10 }}
        />
      )}
    </div>
  )
}
