import { FlowNode, FlowEdge, FlowSessionState, FlowButton, FlowCondition } from '@/types'
import { generateSessionId } from '@/lib/utils'

/**
 * Flow Runner - executes published flow on public page
 */

export function getStartNode(nodes: FlowNode[]): FlowNode | null {
  return nodes.find(n => n.type === 'start') || nodes[0] || null
}

export function getNextNode(
  currentNode: FlowNode,
  edges: FlowEdge[],
  nodes: FlowNode[],
  actionData?: { buttonId?: string; handle?: string }
): FlowNode | null {
  // Find outgoing edges from current node
  const outgoingEdges = edges.filter(e => e.source_node_id === currentNode.id)

  if (outgoingEdges.length === 0) return null

  let targetEdge: FlowEdge | null = null

  if (actionData?.handle) {
    // Find edge by handle (used for button_message, condition, checkout, etc.)
    targetEdge = outgoingEdges.find(e => e.source_handle === actionData.handle) || null
  } else if (actionData?.buttonId) {
    // Find edge matching button id
    targetEdge = outgoingEdges.find(e => e.source_handle === actionData.buttonId) || null
  }

  // Fallback to first edge (for simple sequential nodes)
  if (!targetEdge) {
    targetEdge = outgoingEdges[0]
  }

  if (!targetEdge) return null

  return nodes.find(n => n.id === targetEdge!.target_node_id) || null
}

export function evaluateCondition(
  condition: FlowCondition,
  variables: Record<string, unknown>
): boolean {
  const varValue = variables[condition.variable]
  const condValue = condition.value

  switch (condition.operator) {
    case 'equals':
      return String(varValue) === String(condValue)
    case 'not_equals':
      return String(varValue) !== String(condValue)
    case 'contains':
      return String(varValue).toLowerCase().includes(String(condValue).toLowerCase())
    case 'exists':
      return varValue !== undefined && varValue !== null && varValue !== ''
    case 'greater_than':
      return Number(varValue) > Number(condValue)
    case 'less_than':
      return Number(varValue) < Number(condValue)
    default:
      return false
  }
}

export function getConditionTarget(
  node: FlowNode,
  variables: Record<string, unknown>
): string | null {
  const conditions = node.config.conditions as FlowCondition[] | undefined
  if (!conditions) return node.config.default_target_node_id as string || null

  for (const condition of conditions) {
    if (evaluateCondition(condition, variables)) {
      return condition.target_node_id
    }
  }

  return node.config.default_target_node_id as string || null
}

export function createInitialState(
  pageId: string,
  productId: string | null,
  flowId: string
): FlowSessionState {
  return {
    session_id: generateSessionId(),
    page_id: pageId,
    product_id: productId,
    flow_id: flowId,
    current_node_id: null,
    visible_messages: [],
    variables: {},
    order_id: null,
  }
}

const SESSION_KEY = 'chatfy_session'

export function saveSessionState(state: FlowSessionState): void {
  try {
    sessionStorage.setItem(`${SESSION_KEY}_${state.flow_id}`, JSON.stringify(state))
  } catch {
    // sessionStorage not available
  }
}

export function restoreSessionState(flowId: string): FlowSessionState | null {
  try {
    const saved = sessionStorage.getItem(`${SESSION_KEY}_${flowId}`)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return null
}

export function clearSessionState(flowId: string): void {
  try {
    sessionStorage.removeItem(`${SESSION_KEY}_${flowId}`)
  } catch {
    // ignore
  }
}
