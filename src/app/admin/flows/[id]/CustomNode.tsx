'use client'

import { Handle, Position, NodeProps } from 'reactflow'
import {
  AlertTriangle,
  Bell,
  Clock,
  FileText,
  GitBranch,
  HelpCircle,
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

const nodeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  start: { icon: Play, color: '#10B981', label: 'Inicio' },
  message: { icon: MessageSquare, color: '#635BFF', label: 'Mensagem' },
  text_message: { icon: MessageSquare, color: '#635BFF', label: 'Mensagem' },
  quick_reply: { icon: LayoutList, color: '#8B5CF6', label: 'Respostas' },
  button_message: { icon: LayoutList, color: '#8B5CF6', label: 'Botoes' },
  media_message: { icon: Image, color: '#06B6D4', label: 'Midia' },
  audio_message: { icon: Mic, color: '#22D3EE', label: 'Audio' },
  video_message: { icon: Video, color: '#2F80ED', label: 'Video' },
  image_message: { icon: Image, color: '#06B6D4', label: 'Imagem' },
  file_message: { icon: FileText, color: '#94A3B8', label: 'Arquivo' },
  media_gallery: { icon: Images, color: '#14B8A6', label: 'Galeria' },
  input: { icon: UserPen, color: '#F59E0B', label: 'Captura' },
  capture_input: { icon: UserPen, color: '#F59E0B', label: 'Captura' },
  condition: { icon: GitBranch, color: '#F97316', label: 'Condicao' },
  faq: { icon: HelpCircle, color: '#06B6D4', label: 'FAQ' },
  product_plan: { icon: Tags, color: '#A78BFA', label: 'Planos' },
  checkout: { icon: ShoppingCart, color: '#8B5CF6', label: 'Dados compra' },
  payment: { icon: Wallet, color: '#10B981', label: 'Pix' },
  pix_payment: { icon: Wallet, color: '#10B981', label: 'Pix' },
  wait_payment: { icon: Clock, color: '#F59E0B', label: 'Aguardar Pix' },
  delivery: { icon: Package, color: '#06B6D4', label: 'Entrega' },
  delay: { icon: Clock, color: '#64748B', label: 'Delay' },
  objection: { icon: AlertTriangle, color: '#EF4444', label: 'Objecoes' },
  social_proof: { icon: Star, color: '#F59E0B', label: 'Prova social' },
  update_lead: { icon: Zap, color: '#22D3EE', label: 'Atualizar lead' },
  notification: { icon: Bell, color: '#2F80ED', label: 'Notificacao' },
  error_fallback: { icon: AlertTriangle, color: '#FB7185', label: 'Fallback' },
  end: { icon: Square, color: '#EF4444', label: 'Fim' },
}

function UniversalHandles({ color }: { color: string }) {
  const base = { background: color, border: '2px solid #0D1020', width: 10, height: 10 }

  return (
    <>
      <Handle id="top-target" type="target" position={Position.Top} style={base} />
      <Handle id="right-source" type="source" position={Position.Right} style={base} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} style={base} />
      <Handle id="left-target" type="target" position={Position.Left} style={base} />
    </>
  )
}

export function CustomNode({ data, selected }: NodeProps) {
  const nodeType = data.nodeType || data.type || 'text_message'
  const config = nodeConfig[nodeType] || nodeConfig.text_message
  const Icon = config.icon
  const buttons = Array.isArray(data.config?.buttons) ? data.config.buttons : []
  const objectionButtons = Array.isArray(data.config?.objections) ? data.config.objections : []
  const branchRows = nodeType === 'button_message' || nodeType === 'quick_reply'
      ? buttons.map((button: { id: string; label?: string }, index: number) => ({ id: button.id, label: button.label || `Opcao ${index + 1}`, color: config.color }))
      : nodeType === 'objection'
        ? objectionButtons.map((item: { id: string; label?: string }, index: number) => ({ id: item.id, label: item.label || `Objecao ${index + 1}`, color: config.color }))
        : []

  const preview =
    data.config?.message_text ||
    data.config?.label ||
    data.config?.caption ||
    data.config?.delivery_template ||
    data.config?.file_name ||
    data.title ||
    config.label

  return (
    <div className={`flow-node-card ${selected ? 'is-selected' : ''}`} style={{ '--node-color': config.color } as React.CSSProperties}>
      <UniversalHandles color={config.color} />

      <div className="flow-node-header">
        <div className="flow-node-icon">
          <Icon size={12} />
        </div>
        <p className="flow-node-title">{config.label}</p>
      </div>

      <div className="flow-node-body">
        <p className="flow-node-preview line-clamp-2">
          {String(preview || '').slice(0, 72) || '...'}
        </p>

        {branchRows.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {branchRows.map((handle: { id: string; label?: string; color: string }) => (
              <div key={handle.id} className="flow-node-handle-row">
                <span className="block truncate">{handle.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
