'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { PublicPage, FlowNode, FlowEdge, ChatMessage, FlowSessionState, ThemeConfig, FlowButton, DeliveryPayload } from '@/types'
import {
  getStartNode,
  getNextNode,
  evaluateCondition,
  createInitialState,
  saveSessionState,
  restoreSessionState,
} from '@/lib/flow/flowRunner'
import { generateSessionId, sleep, interpolateTemplate, copyToClipboard } from '@/lib/utils'
import { TypingIndicator } from './TypingIndicator'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatButton } from './ChatButton'
import { CheckoutCard } from './CheckoutCard'
import { PixPaymentCard } from './PixPaymentCard'
import { DeliveryCard } from './DeliveryCard'
import { v4 as uuidv4 } from 'uuid'

interface PublicChatPageProps {
  page: PublicPage
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function PublicChatPage({ page, nodes, edges }: PublicChatPageProps) {
  const theme = (page.theme?.config || {}) as ThemeConfig
  const [state, setState] = useState<FlowSessionState | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingNode, setPendingNode] = useState<FlowNode | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [variables, setVariables] = useState<Record<string, unknown>>({})
  const [inputValue, setInputValue] = useState('')
  const [waitingInput, setWaitingInput] = useState<FlowNode | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [deliveryPayload, setDeliveryPayload] = useState<DeliveryPayload | null>(null)
  const [processingNode, setProcessingNode] = useState(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state?.visible_messages, isTyping, scrollToBottom])

  // Initialize flow
  useEffect(() => {
    if (nodes.length === 0) return

    const existing = restoreSessionState(page.flow_id || '')
    if (existing) {
      setState(existing)
      setVariables(existing.variables)
      setOrderId(existing.order_id)
      return
    }

    const initial = createInitialState(page.id, page.product_id, page.flow_id || '')
    setState(initial)
    setVariables({})

    // Start flow
    const startNode = getStartNode(nodes)
    if (startNode) {
      setTimeout(() => processNode(startNode, initial), 300)
    }

    // Track PageView
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PageView',
        page_id: page.id,
        product_id: page.product_id,
        session_id: initial.session_id,
      }),
    }).catch(() => {})
  }, [nodes.length])

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMsg: ChatMessage = { ...msg, id: uuidv4(), timestamp: Date.now() }
    setState(prev => {
      if (!prev) return prev
      const next = { ...prev, visible_messages: [...prev.visible_messages, fullMsg] }
      saveSessionState(next)
      return next
    })
    return fullMsg
  }, [])

  const processNode = useCallback(async (node: FlowNode, currentState?: FlowSessionState) => {
    if (processingNode) return
    setProcessingNode(true)

    try {
      const vars = currentState?.variables || variables
      setState(prev => prev ? { ...prev, current_node_id: node.id } : prev)

      switch (node.type) {
        case 'start': {
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            setProcessingNode(false)
            await processNode(nextNode)
          }
          break
        }

        case 'text_message': {
          const delay = node.config.delay_ms || 0
          if (delay > 0) await sleep(delay)

          if (node.config.show_typing) {
            setIsTyping(true)
            await sleep(node.config.typing_duration_ms || 1500)
            setIsTyping(false)
          }

          addMessage({
            type: 'assistant',
            content: interpolateTemplate(node.config.message_text || '', vars),
            nodeType: 'text_message',
            nodeId: node.id,
          })

          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            setProcessingNode(false)
            await sleep(300)
            await processNode(nextNode)
            return
          }
          break
        }

        case 'button_message': {
          const delay = node.config.delay_ms || 0
          if (delay > 0) await sleep(delay)

          if (node.config.show_typing) {
            setIsTyping(true)
            await sleep(node.config.typing_duration_ms || 1500)
            setIsTyping(false)
          }

          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: interpolateTemplate(node.config.message_text, vars),
              nodeType: 'button_message',
              nodeId: node.id,
            })
          }

          addMessage({
            type: 'buttons',
            buttons: node.config.buttons || [],
            nodeId: node.id,
            nodeType: 'button_message',
          })
          break
        }

        case 'input': {
          if (node.config.message_text || node.config.label) {
            addMessage({
              type: 'assistant',
              content: interpolateTemplate(node.config.label || node.config.message_text || '', vars),
              nodeId: node.id,
              nodeType: 'input',
            })
          }
          setWaitingInput(node)
          break
        }

        case 'checkout': {
          addMessage({
            type: 'checkout',
            nodeId: node.id,
            nodeType: 'checkout',
            payload: node.config,
          })
          break
        }

        case 'pix_payment': {
          addMessage({
            type: 'pix',
            nodeId: node.id,
            nodeType: 'pix_payment',
            payload: node.config,
          })
          break
        }

        case 'delivery': {
          addMessage({
            type: 'delivery',
            nodeId: node.id,
            nodeType: 'delivery',
            payload: node.config,
          })
          break
        }

        case 'faq': {
          addMessage({
            type: 'faq',
            nodeId: node.id,
            nodeType: 'faq',
            payload: node.config,
          })
          break
        }

        case 'condition': {
          const targetId = node.config.conditions?.find(c =>
            evaluateCondition(c, vars)
          )?.target_node_id || node.config.default_target_node_id

          if (targetId) {
            const targetNode = nodes.find(n => n.id === targetId)
            if (targetNode) {
              setProcessingNode(false)
              await processNode(targetNode)
              return
            }
          }
          break
        }

        case 'redirect': {
          await sleep(node.config.delay_ms || 1000)
          if (node.config.url) {
            window.location.href = node.config.url
          }
          break
        }

        case 'end': {
          if (node.config.final_message) {
            addMessage({
              type: 'assistant',
              content: node.config.final_message,
              nodeId: node.id,
            })
          }
          break
        }

        default: {
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            setProcessingNode(false)
            await processNode(nextNode)
            return
          }
        }
      }
    } finally {
      setProcessingNode(false)
    }
  }, [nodes, edges, variables, addMessage, processingNode])

  const handleButtonClick = useCallback(async (button: FlowButton, nodeId: string) => {
    addMessage({ type: 'user', content: button.label })

    if (button.action_type === 'external_link' && button.external_url) {
      window.open(button.external_url, '_blank')
      return
    }

    if (button.action_type === 'restart_flow') {
      window.location.reload()
      return
    }

    if (button.target_node_id) {
      const targetNode = nodes.find(n => n.id === button.target_node_id)
      if (targetNode) {
        await sleep(300)
        await processNode(targetNode)
      }
    }
  }, [addMessage, nodes, processNode])

  const handleInputSubmit = useCallback(async () => {
    if (!waitingInput || !inputValue.trim()) return
    const node = waitingInput
    const value = inputValue.trim()
    const varName = node.config.variable_name || 'input'

    addMessage({ type: 'user', content: value })
    setInputValue('')
    setWaitingInput(null)

    const newVars = { ...variables, [varName]: value }
    setVariables(newVars)
    setState(prev => prev ? { ...prev, variables: newVars } : prev)

    const nextNode = getNextNode(node, edges, nodes)
    if (nextNode) {
      await sleep(300)
      await processNode(nextNode)
    }
  }, [waitingInput, inputValue, variables, addMessage, nodes, edges, processNode])

  const handleCheckoutSubmit = useCallback(async (customerData: {
    name: string; email: string; whatsapp?: string
  }, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    addMessage({ type: 'user', content: `${customerData.name} - ${customerData.email}` })

    const newVars = { ...variables, ...customerData }
    setVariables(newVars)
    setState(prev => prev ? { ...prev, variables: newVars } : prev)

    const successNodeId = node.config.success_target_node_id
    if (successNodeId) {
      const nextNode = nodes.find(n => n.id === successNodeId)
      if (nextNode) {
        await sleep(300)
        await processNode(nextNode)
      }
    } else {
      const nextNode = getNextNode(node, edges, nodes)
      if (nextNode) {
        await sleep(300)
        await processNode(nextNode)
      }
    }
  }, [nodes, edges, variables, addMessage, processNode])

  const handlePaymentSuccess = useCallback(async (newOrderId: string, nodeId: string) => {
    setOrderId(newOrderId)
    setState(prev => prev ? { ...prev, order_id: newOrderId } : prev)

    const node = nodes.find(n => n.id === nodeId)
    const successNodeId = node?.config.success_target_node_id || node?.config.paid_target_node_id
    if (successNodeId) {
      const nextNode = nodes.find(n => n.id === successNodeId)
      if (nextNode) {
        await sleep(500)
        await processNode(nextNode)
      }
    }
  }, [nodes, processNode])

  const handleDeliveryFetch = useCallback(async (nodeId: string) => {
    if (!orderId || !state?.session_id) return null
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery?session_id=${state.session_id}`)
      if (!res.ok) return null
      const data = await res.json()
      setDeliveryPayload(data.payload)
      return data.payload
    } catch {
      return null
    }
  }, [orderId, state?.session_id])

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.background || '#0f0c29' }}>
        <div className="flex gap-2">
          <div className="typing-dot" style={{ color: theme.typingDot || '#8B5CF6' }} />
          <div className="typing-dot" style={{ color: theme.typingDot || '#8B5CF6' }} />
          <div className="typing-dot" style={{ color: theme.typingDot || '#8B5CF6' }} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col"
      style={{ background: theme.background, fontFamily: theme.fontFamily }}
    >
      {/* Custom CSS */}
      {page.custom_css && <style>{page.custom_css}</style>}

      {/* Header */}
      {page.show_header && (
        <header style={{ background: theme.headerBg, color: theme.headerText }}
          className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b"
          style={{ background: theme.headerBg, borderColor: 'rgba(255,255,255,0.08)' }}>
          {page.avatar_url && (
            <img src={page.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
          )}
          {page.logo_url && !page.avatar_url && (
            <img src={page.logo_url} alt="" className="h-8 object-contain" />
          )}
          <div>
            <p className="text-sm font-bold" style={{ color: theme.headerText }}>{page.public_title}</p>
            {page.public_subtitle && (
              <p className="text-xs opacity-70" style={{ color: theme.headerText }}>{page.public_subtitle}</p>
            )}
          </div>
        </header>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {state.visible_messages.map(msg => {
          if (msg.type === 'assistant' || msg.type === 'user') {
            return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                theme={theme}
                avatarUrl={page.avatar_url}
                isUser={msg.type === 'user'}
              />
            )
          }

          if (msg.type === 'buttons') {
            return (
              <div key={msg.id} className="flex flex-col gap-2 animate-fade-in">
                {msg.buttons?.map(btn => (
                  <ChatButton
                    key={btn.id}
                    button={btn}
                    theme={theme}
                    onClick={() => handleButtonClick(btn, msg.nodeId || '')}
                  />
                ))}
              </div>
            )
          }

          if (msg.type === 'checkout') {
            return (
              <CheckoutCard
                key={msg.id}
                config={msg.payload || {}}
                theme={theme}
                page={page}
                variables={variables}
                onSubmit={(data) => handleCheckoutSubmit(data, msg.nodeId || '')}
              />
            )
          }

          if (msg.type === 'pix') {
            return (
              <PixPaymentCard
                key={msg.id}
                config={msg.payload || {}}
                theme={theme}
                page={page}
                variables={variables}
                orderId={orderId}
                sessionId={state.session_id}
                onPaymentSuccess={(newOrderId) => handlePaymentSuccess(newOrderId, msg.nodeId || '')}
              />
            )
          }

          if (msg.type === 'delivery') {
            return (
              <DeliveryCard
                key={msg.id}
                config={msg.payload || {}}
                theme={theme}
                orderId={orderId}
                sessionId={state.session_id}
                onFetchDelivery={() => handleDeliveryFetch(msg.nodeId || '')}
                existingPayload={deliveryPayload}
              />
            )
          }

          return null
        })}

        {isTyping && <TypingIndicator theme={theme} avatarUrl={page.avatar_url} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {waitingInput && (
        <div className="flex-shrink-0 px-4 pb-4 max-w-2xl mx-auto w-full">
          <div className="flex gap-2">
            <input
              type={waitingInput.config.input_type || 'text'}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInputSubmit()}
              placeholder={waitingInput.config.placeholder || 'Digite aqui...'}
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.inputText,
                outline: 'none',
              }}
            />
            <button
              onClick={handleInputSubmit}
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: theme.button, color: theme.buttonText }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Microcopy */}
      {page.show_microcopy && page.microcopy_text && (
        <div className="flex-shrink-0 py-2 text-center">
          <p className="text-xs opacity-40" style={{ color: theme.assistantText }}>
            {page.microcopy_text}
          </p>
        </div>
      )}

      {/* Powered by */}
      {page.show_powered_by && (
        <div className="flex-shrink-0 py-2 text-center">
          <p className="text-xs opacity-30" style={{ color: theme.assistantText }}>
            Powered by Chatfy
          </p>
        </div>
      )}
    </div>
  )
}
