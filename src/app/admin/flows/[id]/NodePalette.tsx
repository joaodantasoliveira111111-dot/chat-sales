'use client'

import { NodeType } from '@/types'
import {
  Play, MessageSquare, LayoutList, Image, AlignJustify,
  GitBranch, HelpCircle, ShoppingCart, Wallet, Clock,
  Package, Headphones, Zap, ArrowRight, Square,
} from 'lucide-react'

const NODE_TYPES: { type: NodeType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { type: 'start', label: 'Início', icon: Play, color: '#10B981', desc: 'Ponto de entrada do fluxo' },
  { type: 'text_message', label: 'Mensagem', icon: MessageSquare, color: '#8B5CF6', desc: 'Envia uma mensagem de texto' },
  { type: 'button_message', label: 'Botões', icon: LayoutList, color: '#8B5CF6', desc: 'Mensagem com botões de opção' },
  { type: 'input', label: 'Entrada', icon: AlignJustify, color: '#F59E0B', desc: 'Coleta dados do usuário' },
  { type: 'condition', label: 'Condição', icon: GitBranch, color: '#F97316', desc: 'Ramifica o fluxo por condição' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, color: '#06B6D4', desc: 'Perguntas frequentes' },
  { type: 'checkout', label: 'Checkout', icon: ShoppingCart, color: '#8B5CF6', desc: 'Coleta dados de compra' },
  { type: 'pix_payment', label: 'Pix', icon: Wallet, color: '#10B981', desc: 'Gera e exibe cobrança Pix' },
  { type: 'wait_payment', label: 'Aguardar Pag.', icon: Clock, color: '#F59E0B', desc: 'Aguarda confirmação do pagamento' },
  { type: 'delivery', label: 'Entrega', icon: Package, color: '#06B6D4', desc: 'Exibe entrega do produto' },
  { type: 'support', label: 'Suporte', icon: Headphones, color: '#8B5CF6', desc: 'Direciona para suporte' },
  { type: 'action', label: 'Ação', icon: Zap, color: '#F97316', desc: 'Executa ação personalizada' },
  { type: 'redirect', label: 'Redirecionar', icon: ArrowRight, color: '#94A3B8', desc: 'Redireciona para URL' },
  { type: 'end', label: 'Fim', icon: Square, color: '#EF4444', desc: 'Encerra o fluxo' },
]

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="p-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1 mb-3">
        Tipos de Nó
      </p>
      <div className="space-y-1">
        {NODE_TYPES.map(node => {
          const Icon = node.icon
          return (
            <button
              key={node.type}
              onClick={() => onAddNode(node.type)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-all duration-150 text-left group"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${node.color}15`, color: node.color }}
              >
                <Icon size={13} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-300 group-hover:text-white">{node.label}</p>
                <p className="text-[10px] text-slate-600 truncate">{node.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
