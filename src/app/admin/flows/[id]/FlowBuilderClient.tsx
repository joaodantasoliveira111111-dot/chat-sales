'use client'

import { useCallback, useState, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  reconnectEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  Panel,
} from 'reactflow'
import { Flow, FlowNode, FlowEdge, NodeType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { NodeEditorPanel } from './NodeEditorPanel'
import { NodePalette } from './NodePalette'
import { CustomNode } from './CustomNode'
import { v4 as uuidv4 } from 'uuid'
import {
  Save,
  Rocket,
  Eye,
  Plus,
  ChevronLeft,
  Layers,
} from 'lucide-react'
import Link from 'next/link'

const nodeTypes = {
  chatfy_node: CustomNode,
}

interface FlowBuilderClientProps {
  flow: Flow
  initialNodes: FlowNode[]
  initialEdges: FlowEdge[]
  products: { id: string; name: string; price: number }[]
  userId: string
}

function toRFNode(n: FlowNode): Node {
  return {
    id: n.id,
    type: 'chatfy_node',
    position: { x: n.position_x, y: n.position_y },
    data: {
      type: n.type,
      title: n.title || n.type,
      config: n.config,
      nodeType: n.type,
    },
  }
}

function toRFEdge(e: FlowEdge): Edge {
  return {
    id: e.id,
    source: e.source_node_id,
    sourceHandle: normalizeSourceHandle(e.source_handle),
    target: e.target_node_id,
    targetHandle: normalizeTargetHandle(e.target_handle),
    type: 'smoothstep',
    style: { stroke: 'rgba(99,91,255,0.72)', strokeWidth: 2 },
    animated: false,
    reconnectable: true,
  }
}

function normalizeSourceHandle(handle: string | null) {
  if (!handle) return undefined
  if (handle === 'bottom-source' || handle === 'right-source') return handle
  return 'right-source'
}

function normalizeTargetHandle(handle: string | null) {
  if (!handle) return undefined
  if (handle === 'top-target' || handle === 'left-target') return handle
  return 'top-target'
}

function validateFlowBeforePublish(nodes: Node[], edges: Edge[]) {
  const errors: string[] = []
  const startNode = nodes.find(n => n.data.nodeType === 'start' || n.data.type === 'start')
  if (!startNode) errors.push('O fluxo precisa ter um no de inicio')

  const nodeIds = new Set(nodes.map(node => node.id))
  const invalidEdge = edges.find(edge => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))
  if (invalidEdge) errors.push('Existe uma conexao quebrada no fluxo')

  const disconnected = nodes.find(node => {
    const nodeType = node.data.nodeType || node.data.type
    return nodeType !== 'end' && !edges.some(edge => edge.source === node.id)
  })
  if (disconnected) errors.push(`O no "${disconnected.data.title || disconnected.id}" nao tem proximo passo`)

  return errors
}

export function FlowBuilderClient({
  flow: initialFlow,
  initialNodes: initNodes,
  initialEdges: initEdges,
  products,
  userId,
}: FlowBuilderClientProps) {
  const toast = useToast()
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes.map(toRFNode))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges.map(toRFEdge))
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPalette, setShowPalette] = useState(true)
  const [flow, setFlow] = useState(initialFlow)
  const reactFlowInstance = useRef<any>(null)

  const onConnect = useCallback((connection: Connection) => {
    const edge: Edge = {
      ...connection,
      id: uuidv4(),
      type: 'smoothstep',
      style: { stroke: 'rgba(99,91,255,0.72)', strokeWidth: 2 },
      reconnectable: true,
    } as Edge
    setEdges(eds => addEdge(edge, eds.filter(e => (
      e.source !== connection.source || e.sourceHandle !== connection.sourceHandle
    ))))
  }, [setEdges])

  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
  }, [setEdges])

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault()
    event.stopPropagation()
    setEdges(eds => eds.filter(e => e.id !== edge.id))
    toast.success('Ligacao removida')
  }, [setEdges, toast])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const addNode = useCallback((type: NodeType) => {
    const viewport = reactFlowInstance.current?.getViewport() || { x: 0, y: 0, zoom: 1 }
    const id = uuidv4()
    const newNode: Node = {
      id,
      type: 'chatfy_node',
      position: {
        x: (-viewport.x + 300) / viewport.zoom,
        y: (-viewport.y + 200) / viewport.zoom,
      },
      data: {
        type,
        title: type.replace(/_/g, ' '),
        config: getDefaultConfig(type),
        nodeType: type,
      },
    }
    setNodes(nds => [...nds, newNode])
    setSelectedNode(newNode)
  }, [setNodes, reactFlowInstance])

  const updateNodeData = useCallback((nodeId: string, data: Partial<Node['data']>) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    ))
    setSelectedNode(prev => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev)
  }, [setNodes])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId))
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const saveFlow = useCallback(async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // Save nodes
      const dbNodes = nodes.map(n => ({
        id: n.id,
        user_id: userId,
        flow_id: flow.id,
        type: n.data.nodeType || n.data.type,
        title: n.data.title,
        position_x: n.position.x,
        position_y: n.position.y,
        config: n.data.config || {},
      }))

      const dbEdges = edges.map(e => ({
        id: e.id,
        user_id: userId,
        flow_id: flow.id,
        source_node_id: e.source,
        source_handle: e.sourceHandle || null,
        target_node_id: e.target,
        target_handle: e.targetHandle || null,
        condition: null,
      }))

      // Delete existing and re-insert
      const { error: deleteEdgesErr } = await supabase.from('flow_edges').delete().eq('flow_id', flow.id).eq('user_id', userId)
      if (deleteEdgesErr) throw deleteEdgesErr
      const { error: deleteNodesErr } = await supabase.from('flow_nodes').delete().eq('flow_id', flow.id).eq('user_id', userId)
      if (deleteNodesErr) throw deleteNodesErr

      if (dbNodes.length > 0) {
        const { error: nodesErr } = await supabase.from('flow_nodes').insert(dbNodes)
        if (nodesErr) throw nodesErr
      }
      if (dbEdges.length > 0) {
        const { error: edgesErr } = await supabase.from('flow_edges').insert(dbEdges)
        if (edgesErr) throw edgesErr
      }

      // Update flow start_node_id
      const startNode = nodes.find(n => n.data.nodeType === 'start' || n.data.type === 'start')
      const { error: flowErr } = await supabase.from('flows').update({
        start_node_id: startNode?.id || null,
        updated_at: new Date().toISOString(),
      }).eq('id', flow.id).eq('user_id', userId)
      if (flowErr) throw flowErr

      toast.success('Fluxo salvo com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar fluxo')
    } finally {
      setSaving(false)
    }
  }, [nodes, edges, flow.id, userId, toast])

  const publishFlow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Adicione nós ao fluxo antes de publicar')
      return
    }
    const validationErrors = validateFlowBeforePublish(nodes, edges)
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }
    setPublishing(true)
    try {
      await saveFlow()
      const supabase = createClient()
      const { error } = await supabase.from('flows').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', flow.id).eq('user_id', userId)
      if (error) throw error
      setFlow(f => ({ ...f, status: 'published' }))
      toast.success('Fluxo publicado! ✨')
    } catch {
      toast.error('Erro ao publicar fluxo')
    } finally {
      setPublishing(false)
    }
  }, [saveFlow, flow.id, nodes.length, toast])

  return (
    <div className="flow-builder">
      {/* Toolbar */}
      <div className="flow-toolbar">
        <div className="flex items-center gap-3">
          <Link href="/admin/flows" className="flow-icon-button">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="flow-title">{flow.name}</p>
            <div className="flex items-center gap-2">
              <span className={`flow-status-pill ${
                flow.status === 'published'
                  ? 'is-published'
                  : 'is-draft'
              }`}>
                {flow.status === 'published' ? 'Publicado' : 'Rascunho'}
              </span>
              <span className="flow-meta">{nodes.length} nós</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
          >
            <Layers size={14} />
            {showPalette ? 'Ocultar' : 'Tipos de Nó'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={saveFlow}
            loading={saving}
          >
            <Save size={14} />
            Salvar
          </Button>
          <Button
            size="sm"
            onClick={publishFlow}
            loading={publishing}
          >
            <Rocket size={14} />
            Publicar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        {showPalette && (
          <div className="flow-palette">
            <NodePalette onAddNode={addNode} />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={instance => { reactFlowInstance.current = instance }}
            fitView
            edgesUpdatable
            edgesFocusable
            deleteKeyCode={['Backspace', 'Delete']}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: 'rgba(99,91,255,0.5)', strokeWidth: 2 },
            }}
          >
            <Background color="rgba(148,163,184,0.08)" gap={24} />
            <Controls className="react-flow__controls" />
            <MiniMap
              nodeColor={() => 'rgba(99,91,255,0.68)'}
              maskColor="rgba(0,0,0,0.4)"
            />
            <Panel position="bottom-center">
              <div className="flow-help-panel">
                <span>Clique nos nos para editar - Duplo clique na linha ou Delete para cortar ligacao</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Node Editor */}
        {selectedNode && (
          <div className="flow-editor-panel">
            <NodeEditorPanel
              node={selectedNode}
              products={products}
              userId={userId}
              flowId={flow.id}
              onChange={(data) => updateNodeData(selectedNode.id, data)}
              onDelete={() => deleteNode(selectedNode.id)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function getDefaultConfig(type: NodeType): Record<string, unknown> {
  const salesDefaults: Partial<Record<NodeType, Record<string, unknown>>> = {
    message: { message_text: 'Oi! Vi que voce quer saber mais. Posso te explicar rapidinho?', show_typing: true, typing_duration_ms: 900, delay_ms: 0 },
    text_message: { message_text: 'Oi! Vi que voce quer saber mais. Posso te explicar rapidinho?', show_typing: true, typing_duration_ms: 900, delay_ms: 0 },
    quick_reply: { message_text: 'Qual opcao faz mais sentido pra voce?', buttons: [] },
    button_message: { message_text: 'Qual opcao faz mais sentido pra voce?', buttons: [] },
    media_message: { media_type: 'image', media_url: '', caption: '' },
    audio_message: { media_type: 'audio', media_url: '', caption: '', show_typing: true, typing_duration_ms: 700 },
    video_message: { media_type: 'video', media_url: '', caption: '' },
    image_message: { media_type: 'image', media_url: '', caption: '' },
    file_message: { media_type: 'document', media_url: '', caption: '', button_text: 'Abrir arquivo' },
    media_gallery: { message_text: 'Olha isso aqui:', media_items: [] },
    capture_input: { label: 'Perfeito. Me diz seu nome completo.', input_type: 'text', variable_name: 'lead.name', required: true },
    input: { label: 'Perfeito. Me diz seu nome completo.', input_type: 'text', variable_name: 'lead.name', required: true },
    condition: { conditions: [], default_target_node_id: null },
    product_plan: { message_text: 'Escolha como voce prefere comecar:', plans: [], buttons: [] },
    checkout: { summary_title: 'Confirme seus dados', button_text: 'Continuar para pagamento', required_fields: ['name', 'email'] },
    payment: { expiration_minutes: 30, pending_text: 'Pix gerado. Copie o codigo abaixo e pague no seu banco.', copy_button_text: 'Copiar codigo Pix' },
    pix_payment: { expiration_minutes: 30, pending_text: 'Pix gerado. Copie o codigo abaixo e pague no seu banco.', copy_button_text: 'Copiar codigo Pix' },
    wait_payment: { polling_interval_seconds: 5, timeout_minutes: 30 },
    delivery: { delivery_template: 'Pagamento aprovado.\n\nAqui esta seu acesso, {{lead.name}}:\n{{delivery.link}}' },
    faq: { faqs: [], final_button_text: 'Voltar para compra' },
    delay: { delay_ms: 900 },
    objection: { message_text: 'Entendo. O que ficou travando pra voce?', objections: [] },
    social_proof: { message_text: 'Olha o que quem entrou hoje recebeu:', proof_items: [], buttons: [] },
    update_lead: { update_field: 'lead.stage', update_value: 'interessado' },
    notification: { notification_channel: 'internal', notification_message: 'Novo lead quente no fluxo' },
    error_fallback: { final_message: 'Tive um problema aqui, mas sua conversa ficou registrada. Nossa equipe vai te chamar em instantes.' },
    end: { final_message: 'Obrigado! Ate logo!', restart_button: false },
  }
  if (salesDefaults[type]) return salesDefaults[type] || {}

  const defaults: Partial<Record<NodeType, Record<string, unknown>>> = {
    text_message: { message_text: 'Olá! 👋', show_typing: true, typing_duration_ms: 1500, delay_ms: 0 },
    button_message: { message_text: 'Escolha uma opção:', buttons: [] },
    input: { label: 'Qual é o seu nome?', input_type: 'text', variable_name: 'customer_name', required: true },
    checkout: { summary_title: 'Confirme seus dados', button_text: 'Continuar para pagamento', required_fields: ['name', 'email'] },
    pix_payment: { expiration_minutes: 30, pending_text: 'Escaneie o QR Code ou copie o código Pix', copy_button_text: '📋 Copiar código Pix' },
    wait_payment: { polling_interval_seconds: 5, timeout_minutes: 30 },
    delivery: { delivery_template: 'Aqui está seu acesso, {{customer_name}}! 🎉' },
    faq: { faqs: [], final_button_text: 'Voltar para compra' },
    condition: { conditions: [], default_target_node_id: null },
    end: { final_message: 'Obrigado! Até logo! 👋', restart_button: false },
  }
  return defaults[type] || {}
}

export default function FlowBuilderPage(props: FlowBuilderClientProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilderClient {...props} />
    </ReactFlowProvider>
  )
}
