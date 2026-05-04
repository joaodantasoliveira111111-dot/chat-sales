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
  start: { icon: Play, color: '#16A34A', label: 'Inicio' },
  message: { icon: MessageSquare, color: '#0B7CFF', label: 'Mensagem' },
  text_message: { icon: MessageSquare, color: '#0B7CFF', label: 'Mensagem' },
  quick_reply: { icon: LayoutList, color: '#6D5DF6', label: 'Respostas' },
  button_message: { icon: LayoutList, color: '#6D5DF6', label: 'Botoes' },
  media_message: { icon: Image, color: '#00C2FF', label: 'Midia' },
  audio_message: { icon: Mic, color: '#00C2FF', label: 'Audio' },
  video_message: { icon: Video, color: '#0B7CFF', label: 'Video' },
  image_message: { icon: Image, color: '#00C2FF', label: 'Imagem' },
  file_message: { icon: FileText, color: '#71869B', label: 'Arquivo' },
  media_gallery: { icon: Images, color: '#00C2FF', label: 'Galeria' },
  input: { icon: UserPen, color: '#F97316', label: 'Captura' },
  capture_input: { icon: UserPen, color: '#F97316', label: 'Captura' },
  condition: { icon: GitBranch, color: '#F97316', label: 'Condicao' },
  faq: { icon: HelpCircle, color: '#00C2FF', label: 'FAQ' },
  product_plan: { icon: Tags, color: '#6D5DF6', label: 'Planos' },
  checkout: { icon: ShoppingCart, color: '#6D5DF6', label: 'Dados compra' },
  payment: { icon: Wallet, color: '#16A34A', label: 'Pix' },
  pix_payment: { icon: Wallet, color: '#16A34A', label: 'Pix' },
  wait_payment: { icon: Clock, color: '#F97316', label: 'Aguardar Pix' },
  delivery: { icon: Package, color: '#00C2FF', label: 'Entrega' },
  delay: { icon: Clock, color: '#71869B', label: 'Delay' },
  objection: { icon: AlertTriangle, color: '#DC2626', label: 'Objecoes' },
  social_proof: { icon: Star, color: '#F97316', label: 'Prova social' },
  update_lead: { icon: Zap, color: '#00C2FF', label: 'Atualizar lead' },
  notification: { icon: Bell, color: '#0B7CFF', label: 'Notificacao' },
  error_fallback: { icon: AlertTriangle, color: '#DC2626', label: 'Fallback' },
  end: { icon: Square, color: '#DC2626', label: 'Fim' },
}

function UniversalHandles({ color }: { color: string }) {
	const base = { background: color, border: '2px solid white', width: 10, height: 10, boxShadow: '0 1px 4px rgba(8,24,39,0.12)' }

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
