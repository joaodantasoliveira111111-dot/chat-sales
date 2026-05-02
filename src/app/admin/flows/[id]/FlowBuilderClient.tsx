'use client'

import { useCallback, useState, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
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
    sourceHandle: e.source_handle || undefined,
    target: e.target_node_id,
    targetHandle: e.target_handle || undefined,
    type: 'smoothstep',
    style: { stroke: 'rgba(139,92,246,0.7)', strokeWidth: 2 },
    animated: false,
  }
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
      id: `edge_${uuidv4()}`,
      type: 'smoothstep',
      style: { stroke: 'rgba(139,92,246,0.7)', strokeWidth: 2 },
    } as Edge
    setEdges(eds => addEdge(edge, eds))
  }, [setEdges])

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
      await supabase.from('flow_edges').delete().eq('flow_id', flow.id)
      await supabase.from('flow_nodes').delete().eq('flow_id', flow.id)

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
      await supabase.from('flows').update({
        start_node_id: startNode?.id || null,
        updated_at: new Date().toISOString(),
      }).eq('id', flow.id)

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
    setPublishing(true)
    try {
      await saveFlow()
      const supabase = createClient()
      await supabase.from('flows').update({
        status: 'published',
        published_at: new Date().toISOString(),
      }).eq('id', flow.id)
      setFlow(f => ({ ...f, status: 'published' }))
      toast.success('Fluxo publicado! ✨')
    } catch {
      toast.error('Erro ao publicar fluxo')
    } finally {
      setPublishing(false)
    }
  }, [saveFlow, flow.id, nodes.length, toast])

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0d0d15] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin/flows" className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <p className="text-sm font-semibold text-white">{flow.name}</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                flow.status === 'published'
                  ? 'bg-green-400/10 text-green-400'
                  : 'bg-yellow-400/10 text-yellow-400'
              }`}>
                {flow.status === 'published' ? 'Publicado' : 'Rascunho'}
              </span>
              <span className="text-xs text-slate-500">{nodes.length} nós</span>
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
          <div className="w-56 flex-shrink-0 border-r border-white/5 overflow-y-auto bg-[#0d0d15]">
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
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={instance => { reactFlowInstance.current = instance }}
            fitView
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: 'rgba(139,92,246,0.5)', strokeWidth: 2 },
            }}
          >
            <Background color="rgba(255,255,255,0.03)" gap={24} />
            <Controls className="react-flow__controls" />
            <MiniMap
              nodeColor={() => 'rgba(139,92,246,0.6)'}
              maskColor="rgba(0,0,0,0.4)"
            />
            <Panel position="bottom-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#111118]/90 backdrop-blur text-xs text-slate-400">
                <span>Clique nos nós para editar • Arraste para conectar • Scroll para zoom</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Node Editor */}
        {selectedNode && (
          <div className="w-80 flex-shrink-0 border-l border-white/5 overflow-y-auto bg-[#0d0d15]">
            <NodeEditorPanel
              node={selectedNode}
              products={products}
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
