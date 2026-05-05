'use client'

import { PublicPage, FlowNode, FlowEdge } from '@/types'
import { BrowserMetaSettings } from '@/lib/meta/browser'
import { useFlowEngine } from './useFlowEngine'
import { ChatRenderer } from './ChatRenderer'

interface PublicChatPageProps {
  page: PublicPage
  nodes: FlowNode[]
  edges: FlowEdge[]
  metaSettings?: BrowserMetaSettings | null
}

export function PublicChatPage({ page, nodes, edges, metaSettings }: PublicChatPageProps) {
  const engine = useFlowEngine({ page, nodes, edges, metaSettings })
  return <ChatRenderer page={page} nodes={nodes} engine={engine} />
}
