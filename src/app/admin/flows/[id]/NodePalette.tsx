'use client'

import { NodeType } from '@/types'
import {
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  GitBranch,
  Image,
  Images,
  LayoutList,
  MessageSquare,
  Mic,
  Package,
  Play,
  ShoppingCart,
  Square,
  Star,
  Tags,
  UserPen,
  Video,
  Wallet,
  Zap,
} from 'lucide-react'

const NODE_TYPES: { type: NodeType; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { type: 'start', label: 'Inicio', icon: Play, color: '#16A34A', desc: 'Entrada da venda X1' },
  { type: 'text_message', label: 'Mensagem', icon: MessageSquare, color: '#0B7CFF', desc: 'Texto curto e natural' },
  { type: 'audio_message', label: 'Audio', icon: Mic, color: '#00C2FF', desc: 'Explicacao em audio' },
  { type: 'video_message', label: 'Video', icon: Video, color: '#0B7CFF', desc: 'Demo, VSL ou prova' },
  { type: 'image_message', label: 'Imagem', icon: Image, color: '#00C2FF', desc: 'Print, foto ou oferta' },
  { type: 'file_message', label: 'Arquivo', icon: FileText, color: '#71869B', desc: 'PDF ou material' },
  { type: 'media_gallery', label: 'Galeria', icon: Images, color: '#00C2FF', desc: 'Sequencia de midias' },
  { type: 'quick_reply', label: 'Respostas', icon: LayoutList, color: '#6D5DF6', desc: 'Botoes compactos' },
  { type: 'capture_input', label: 'Captura', icon: UserPen, color: '#F97316', desc: 'Nome, email, WhatsApp' },
  { type: 'condition', label: 'Condicao', icon: GitBranch, color: '#F97316', desc: 'Caminhos por resposta' },
  { type: 'product_plan', label: 'Planos', icon: Tags, color: '#6D5DF6', desc: 'Escolha de produto/plano' },
  { type: 'checkout', label: 'Dados compra', icon: ShoppingCart, color: '#6D5DF6', desc: 'Coleta conversacional' },
  { type: 'payment', label: 'Pix', icon: Wallet, color: '#16A34A', desc: 'Pagamento no chat' },
  { type: 'wait_payment', label: 'Aguardar Pix', icon: Clock, color: '#F97316', desc: 'Retoma apos webhook' },
  { type: 'delivery', label: 'Entrega', icon: Package, color: '#00C2FF', desc: 'Entrega automatica' },
  { type: 'delay', label: 'Delay', icon: Clock, color: '#71869B', desc: 'Pausa natural' },
  { type: 'objection', label: 'Objecoes', icon: AlertTriangle, color: '#DC2626', desc: 'Quebra de objecoes' },
  { type: 'social_proof', label: 'Prova social', icon: Star, color: '#F97316', desc: 'Prints e depoimentos' },
  { type: 'update_lead', label: 'Atualizar lead', icon: Zap, color: '#00C2FF', desc: 'Tags e variaveis' },
  { type: 'notification', label: 'Notificacao', icon: Bell, color: '#0B7CFF', desc: 'Alerta interno/webhook' },
  { type: 'error_fallback', label: 'Fallback', icon: AlertTriangle, color: '#DC2626', desc: 'Rota de erro segura' },
  { type: 'end', label: 'Fim', icon: Square, color: '#DC2626', desc: 'Encerra a conversa' },
]

interface NodePaletteProps {
  onAddNode: (type: NodeType) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="p-3">
      <p className="px-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#71869B]">
        Componentes
      </p>
      <div className="space-y-0.5">
        {NODE_TYPES.map(node => {
          const Icon = node.icon
          return (
            <button
              key={node.type}
              onClick={() => onAddNode(node.type)}
              className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all duration-150 hover:bg-[rgba(8,24,39,0.04)]"
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${node.color}14`, color: node.color }}
              >
                <Icon size={13} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#35516B] group-hover:text-[#081827] transition-colors">{node.label}</p>
                <p className="truncate text-[10px] text-[#71869B]">{node.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
