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
  clearSessionState,
} from '@/lib/flow/flowRunner'
import { sleep, renderTemplateVariables } from '@/lib/utils'
import { TypingIndicator } from './TypingIndicator'
import { MessageBubble } from './MessageBubble'
import { MediaMessageBubble } from './MediaMessageBubble'
import { QuickReplyButtons } from './QuickReplyButtons'
import { ConversationalFormFlow } from './ConversationalFormFlow'
import { ChatLayout } from './ChatLayout'
import { ChatHeader } from './ChatHeader'
import { ChatInputBar } from './ChatInputBar'
import { PixPaymentCard } from './PixPaymentCard'
import { DeliveryCard } from './DeliveryCard'
import { getMetaBrowserContext, loadMetaPixel, trackMetaBrowserEvent, BrowserMetaSettings } from '@/lib/meta/browser'
import { generateMetaEventId, toMetaEventName } from '@/lib/meta/events'
import { v4 as uuidv4 } from 'uuid'

const textNodeTypes = ['text_message', 'message']
const buttonNodeTypes = ['button_message', 'quick_reply']
const inputNodeTypes = ['input', 'capture_input']
const mediaNodeTypes = ['media_message', 'audio_message', 'video_message', 'image_message', 'file_message']

function buildTemplateContext(page: PublicPage, nodes: FlowNode[], variables: Record<string, unknown>) {
  const context: Record<string, unknown> = {
    ...variables,
    lead: {
      name: variables['lead.name'] || variables.name || variables.customer_name,
      email: variables['lead.email'] || variables.email || variables.customer_email,
      phone: variables['lead.phone'] || variables.phone || variables.whatsapp || variables.customer_whatsapp,
      city: variables['lead.city'] || variables.city,
    },
    product: {
      id: page.product?.id || page.product_id || variables['product.id'],
      name: page.product?.name || variables['product.name'] || page.public_title || 'esse acesso',
      price: page.product?.price ?? variables['product.price'],
      description: page.product?.description || variables['product.description'],
    },
    plan: {
      name: variables['plan.name'],
      price: variables['plan.price'],
    },
    order: {
      id: variables['order.id'],
      amount: variables['order.amount'] || variables['plan.price'] || page.product?.price,
      status: variables['order.status'],
    },
    payment: {
      status: variables['payment.status'],
      pix_code: variables['payment.pix_code'],
      qr_code: variables['payment.qr_code'],
    },
    delivery: {
      link: variables['delivery.link'],
      button_text: variables['delivery.button_text'],
      content: variables['delivery.content'],
    },
    account: {
      login: variables['account.login'],
      password: variables['account.password'],
      email: variables['account.email'],
      extra_info: variables['account.extra_info'],
    },
    system: {
      support_whatsapp: variables['system.support_whatsapp'] || page.product?.support_text || page.public_subtitle,
    },
  }

  Object.entries(variables).forEach(([key, value]) => {
    if (!key.includes('.')) return
    const parts = key.split('.')
    let cursor = context
    parts.slice(0, -1).forEach(part => {
      const next = cursor[part]
      if (!next || typeof next !== 'object') cursor[part] = {}
      cursor = cursor[part] as Record<string, unknown>
    })
    cursor[parts[parts.length - 1]] = value
  })

  const planNode = nodes.find(node => node.type === 'product_plan' && Array.isArray(node.config.plans))
  const plans = Array.isArray(planNode?.config.plans) ? planNode.config.plans : []
  plans.forEach((plan: any, index: number) => {
    const key = `plan_${index + 1}`
    const planData = {
      id: plan.id,
      name: plan.plan_name || plan.label || `Plano ${index + 1}`,
      price: plan.price ?? page.product?.price,
      description: plan.description,
    }
    context[key] = planData
    context[`${key}.name`] = planData.name
    context[`${key}.price`] = planData.price
  })

  return context
}

function hasRepeatedAssistantLoop(messages: ChatMessage[]) {
  let previous = ''
  let count = 0

  for (const message of messages) {
    if (message.type !== 'assistant' || !message.content) {
      previous = ''
      count = 0
      continue
    }

    if (message.content === previous) {
      count += 1
      if (count >= 3) return true
    } else {
      previous = message.content
      count = 1
    }
  }

  return false
}

interface PublicChatPageProps {
  page: PublicPage
  nodes: FlowNode[]
  edges: FlowEdge[]
  metaSettings?: BrowserMetaSettings | null
}

export function PublicChatPage({ page, nodes, edges, metaSettings }: PublicChatPageProps) {
  const theme = (page.theme?.config || {}) as ThemeConfig
  const template = (page.theme_id || 'whatsapp').replace(/[^a-z0-9_-]/gi, '_')
  const [state, setState] = useState<FlowSessionState | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [variables, setVariables] = useState<Record<string, unknown>>({})
  const [inputValue, setInputValue] = useState('')
  const [waitingInput, setWaitingInput] = useState<FlowNode | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [deliveryPayload, setDeliveryPayload] = useState<DeliveryPayload | null>(null)
  const [processingNode, setProcessingNode] = useState(false)
  const processingRef = useRef(false)
  const initializedRef = useRef(false)
  const metaContextRef = useRef<Record<string, unknown>>({})

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [state?.visible_messages, isTyping, scrollToBottom])

  // Initialize flow
  useEffect(() => {
    if (nodes.length === 0) return
    if (initializedRef.current) return
    initializedRef.current = true

    const existing = restoreSessionState(page.flow_id || '')
    if (existing) {
      if (hasRepeatedAssistantLoop(existing.visible_messages)) {
        clearSessionState(page.flow_id || '')
      } else {
        setState(existing)
        setVariables(existing.variables)
        setOrderId(existing.order_id)
        return
      }
    }

    const initial = createInitialState(page.id, page.product_id, page.flow_id || '')
    setState(initial)
    setVariables({})
    metaContextRef.current = getMetaBrowserContext()
    loadMetaPixel(metaSettings || {}, {
      external_id: initial.session_id,
    })

    // Start flow
    const startNode = getStartNode(nodes)
    if (startNode) {
      setTimeout(() => processNode(startNode, initial), 300)
    }

    // Track PageView
    const pageViewEventId = trackMetaBrowserEvent('PageView', {
      session_id: initial.session_id,
      page_id: page.id,
      product_id: page.product_id,
      flow_id: page.flow_id,
    })
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'PageView',
        page_id: page.id,
        product_id: page.product_id,
        flow_id: page.flow_id,
        user_id: page.user_id,
        session_id: initial.session_id,
        event_id: pageViewEventId || generateMetaEventId('PageView', { session_id: initial.session_id }),
        source: 'both',
        ...metaContextRef.current,
      }),
    }).catch(() => {})
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ChatOpened',
        page_id: page.id,
        product_id: page.product_id,
        flow_id: page.flow_id,
        user_id: page.user_id,
        session_id: initial.session_id,
        event_id: generateMetaEventId('ChatOpened', { session_id: initial.session_id }),
        source: 'server',
        ...metaContextRef.current,
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

  const trackChatEvent = useCallback((event: string, data: Record<string, unknown> = {}) => {
    const sessionId = state?.session_id
    const metaEventName = toMetaEventName(event)
    const eventContext = {
      event,
      page_id: page.id,
      product_id: page.product_id,
      flow_id: page.flow_id,
      user_id: page.user_id,
      order_id: orderId || data.order_id,
      session_id: sessionId,
      ...data,
    }
    const browserEventId = metaSettings?.browser_tracking_enabled !== false
      ? trackMetaBrowserEvent(metaEventName, eventContext, {
          ...data,
          page_id: page.id,
          product_id: page.product_id,
          flow_id: page.flow_id,
          order_id: orderId || data.order_id,
          content_ids: page.product_id ? [page.product_id] : undefined,
          content_name: page.product?.name || page.public_title,
          value: page.product?.price,
          currency: page.product?.currency || 'BRL',
        })
      : ''
    const eventId = browserEventId || generateMetaEventId(metaEventName, eventContext)
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        page_id: page.id,
        product_id: page.product_id,
        flow_id: page.flow_id,
        user_id: page.user_id,
        order_id: orderId || undefined,
        session_id: sessionId,
        event_id: eventId,
        source: browserEventId ? 'both' : 'server',
        ...metaContextRef.current,
        ...data,
      }),
    }).catch(() => {})
  }, [page.id, page.product_id, page.flow_id, page.user_id, page.product?.name, page.product?.price, page.product?.currency, page.public_title, state?.session_id, orderId, metaSettings?.browser_tracking_enabled])

  const renderText = useCallback((templateValue: unknown, scopedVariables: Record<string, unknown> = variables) => {
    return renderTemplateVariables(String(templateValue || ''), buildTemplateContext(page, nodes, scopedVariables))
  }, [page, nodes, variables])

  const renderButtons = useCallback((buttons: FlowButton[] = [], scopedVariables: Record<string, unknown> = variables) => {
    return buttons.map(button => ({
      ...button,
      label: renderText(button.label, scopedVariables),
    }))
  }, [renderText, variables])

  const processNode = useCallback(async (node: FlowNode, currentState?: FlowSessionState, visited = new Set<string>()) => {
    if (processingRef.current) return
    if (visited.has(node.id)) {
      console.warn('[flow-runner] ciclo interrompido no no', node.id)
      return
    }
    const nextVisited = new Set(visited)
    nextVisited.add(node.id)
    processingRef.current = true
    setProcessingNode(true)

    try {
      const vars = currentState?.variables || variables
      const nodeType = node.type
      const continueTo = async (nextNode: FlowNode, delayMs = 0) => {
        processingRef.current = false
        setProcessingNode(false)
        if (delayMs > 0) await sleep(delayMs)
        await processNode(nextNode, currentState, nextVisited)
      }
      trackChatEvent('ViewNode', { session_id: currentState?.session_id, node_id: node.id, node_type: node.type, node_title: node.title })
      if (['product_plan', 'checkout', 'payment', 'pix_payment'].includes(node.type)) {
        trackChatEvent('ViewContent', { session_id: currentState?.session_id, node_id: node.id, node_type: node.type })
      }
      setState(prev => prev ? { ...prev, current_node_id: node.id } : prev)

      if (textNodeTypes.includes(nodeType)) {
        const delay = node.config.delay_ms || 0
        if (delay > 0) await sleep(delay)

        if (node.config.show_typing !== false) {
          setIsTyping(true)
          await sleep(Number(node.config.typing_duration_ms) || 850)
          setIsTyping(false)
        }

        addMessage({
          type: 'assistant',
          content: renderText(node.config.message_text || '', vars),
          nodeType: node.type,
          nodeId: node.id,
        })

        const nextNode = getNextNode(node, edges, nodes)
        if (nextNode) {
          await continueTo(nextNode, 300)
          return
        }
      } else if (buttonNodeTypes.includes(nodeType)) {
        const delay = node.config.delay_ms || 0
        if (delay > 0) await sleep(delay)

        if (node.config.show_typing !== false) {
          setIsTyping(true)
          await sleep(Number(node.config.typing_duration_ms) || 850)
          setIsTyping(false)
        }

        if (node.config.message_text) {
          addMessage({
            type: 'assistant',
            content: renderText(node.config.message_text, vars),
            nodeType: node.type,
            nodeId: node.id,
          })
        }

        addMessage({
          type: 'buttons',
          buttons: renderButtons(node.config.buttons || [], vars),
          nodeId: node.id,
          nodeType: node.type,
        })
      } else if (inputNodeTypes.includes(nodeType)) {
        if (node.config.message_text || node.config.label) {
          addMessage({
            type: 'assistant',
            content: renderText(node.config.label || node.config.message_text || '', vars),
            nodeId: node.id,
            nodeType: node.type,
          })
        }
        setWaitingInput(node)
      } else if (mediaNodeTypes.includes(nodeType)) {
        const delay = node.config.delay_ms || 0
        if (delay > 0) await sleep(delay)

        if (node.config.show_typing !== false) {
          setIsTyping(true)
          await sleep(Number(node.config.typing_duration_ms) || 700)
          setIsTyping(false)
        }

        addMessage({
          type: 'media',
          content: renderText(node.config.caption || '', vars),
          nodeId: node.id,
          nodeType: node.type,
          payload: node.config,
        })

        const nextNode = getNextNode(node, edges, nodes)
        if (nextNode) {
          await continueTo(nextNode, 350)
          return
        }
      } else switch (node.type) {
        case 'start': {
          trackChatEvent('FlowStarted', { session_id: currentState?.session_id, node_id: node.id })
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode)
          }
          break
        }

        case 'text_message': {
          const delay = node.config.delay_ms || 0
          if (delay > 0) await sleep(delay)

          if (node.config.show_typing !== false) {
            setIsTyping(true)
            await sleep(Number(node.config.typing_duration_ms) || 850)
            setIsTyping(false)
          }

          addMessage({
            type: 'assistant',
            content: renderText(node.config.message_text || '', vars),
            nodeType: 'text_message',
            nodeId: node.id,
          })

          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode, 300)
            return
          }
          break
        }

        case 'button_message': {
          const delay = node.config.delay_ms || 0
          if (delay > 0) await sleep(delay)

          if (node.config.show_typing !== false) {
            setIsTyping(true)
            await sleep(Number(node.config.typing_duration_ms) || 850)
            setIsTyping(false)
          }

          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.message_text, vars),
              nodeType: 'button_message',
              nodeId: node.id,
            })
          }

          addMessage({
            type: 'buttons',
            buttons: renderButtons(node.config.buttons || [], vars),
            nodeId: node.id,
            nodeType: 'button_message',
          })
          break
        }

        case 'input': {
          if (node.config.message_text || node.config.label) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.label || node.config.message_text || '', vars),
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

        case 'product_plan': {
          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.message_text, vars),
              nodeType: 'product_plan',
              nodeId: node.id,
            })
          }

          const planButtons = Array.isArray(node.config.plans)
            ? node.config.plans.map((plan: any) => ({
                id: plan.id,
                label: renderText(plan.button_text || plan.label || plan.plan_name || 'Escolher plano', vars),
                action_type: 'go_to_node' as const,
              }))
            : node.config.buttons || []

          addMessage({
            type: 'buttons',
            buttons: planButtons,
            nodeId: node.id,
            nodeType: 'product_plan',
          })
          break
        }

        case 'media_gallery': {
          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.message_text, vars),
              nodeId: node.id,
              nodeType: 'media_gallery',
            })
          }

          const items = Array.isArray(node.config.media_items) ? node.config.media_items : []
          for (const item of items) {
            await sleep(350)
            addMessage({
              type: 'media',
              content: renderText(item.caption || '', vars),
              nodeId: node.id,
              nodeType: 'media_gallery',
              payload: {
                media_type: item.type,
                media_url: item.url,
                caption: item.caption,
                file_name: item.file_name,
                thumbnail_url: item.thumbnail_url,
              },
            })
          }

          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode, 350)
            return
          }
          break
        }

        case 'payment': {
          addMessage({
            type: 'pix',
            nodeId: node.id,
            nodeType: 'payment',
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

        case 'delay': {
          await sleep(Number(node.config.delay_ms) || 900)
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode)
            return
          }
          break
        }

        case 'objection': {
          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.message_text, vars),
              nodeId: node.id,
              nodeType: 'objection',
            })
          }
          const objectionButtons = Array.isArray(node.config.objections)
            ? node.config.objections.map((item: any) => ({
                id: item.id,
                label: item.label,
                action_type: 'go_to_node' as const,
              }))
            : []
          addMessage({
            type: 'buttons',
            buttons: objectionButtons,
            nodeId: node.id,
            nodeType: 'objection',
          })
          break
        }

        case 'social_proof': {
          if (node.config.message_text) {
            addMessage({
              type: 'assistant',
              content: renderText(node.config.message_text, vars),
              nodeId: node.id,
              nodeType: 'social_proof',
            })
          }
          const items = Array.isArray(node.config.proof_items) ? node.config.proof_items : Array.isArray(node.config.media_items) ? node.config.media_items : []
          for (const item of items) {
            await sleep(350)
            addMessage({
              type: 'media',
              content: renderText(item.caption || '', vars),
              nodeId: node.id,
              nodeType: 'social_proof',
              payload: { media_type: item.type, media_url: item.url, file_name: item.file_name, thumbnail_url: item.thumbnail_url },
            })
          }
          if (Array.isArray(node.config.buttons) && node.config.buttons.length > 0) {
            addMessage({ type: 'buttons', buttons: renderButtons(node.config.buttons, vars), nodeId: node.id, nodeType: 'social_proof' })
          } else {
            const nextNode = getNextNode(node, edges, nodes)
            if (nextNode) {
              await continueTo(nextNode, 350)
              return
            }
          }
          break
        }

        case 'update_lead': {
          const field = String(node.config.update_field || '')
          if (field) {
            const value = renderText(String(node.config.update_value || ''), vars)
            const nextVars = { ...vars, [field]: value }
            setVariables(nextVars)
            setState(prev => prev ? { ...prev, variables: nextVars } : prev)
          }
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode)
            return
          }
          break
        }

        case 'notification': {
          if (node.config.notification_channel === 'webhook' && node.config.url) {
            fetch(String(node.config.url), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ page_id: page.id, flow_id: page.flow_id, session_id: currentState?.session_id, variables: vars }),
            }).catch(() => {})
          }
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode)
            return
          }
          break
        }

        case 'error_fallback': {
          addMessage({
            type: 'assistant',
            content: renderText(node.config.final_message || 'Tive um problema aqui, mas ja registrei sua conversa.', vars),
            nodeId: node.id,
            nodeType: 'error_fallback',
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
              await continueTo(targetNode)
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
              content: renderText(node.config.final_message, variables),
              nodeId: node.id,
            })
          }
          break
        }

        default: {
          const nextNode = getNextNode(node, edges, nodes)
          if (nextNode) {
            await continueTo(nextNode)
            return
          }
        }
      }
    } finally {
      processingRef.current = false
      setProcessingNode(false)
    }
  }, [nodes, edges, variables, addMessage, trackChatEvent, renderText, renderButtons])

  const handleButtonClick = useCallback(async (button: FlowButton, nodeId: string) => {
    addMessage({ type: 'user', content: button.label })
    trackChatEvent('QuickReplyClicked', { node_id: nodeId, button_id: button.id, button_label: button.label })

    if (button.action_type === 'external_link' && button.external_url) {
      trackChatEvent('SupportClicked', { node_id: nodeId, button_id: button.id, button_label: button.label, url: button.external_url })
      window.open(button.external_url, '_blank')
      return
    }

    if (button.action_type === 'restart_flow') {
      window.location.reload()
      return
    }

    const currentNode = nodes.find(n => n.id === nodeId)
    if (currentNode?.type === 'objection') {
      const objection = Array.isArray(currentNode.config.objections)
        ? currentNode.config.objections.find((item: any) => item.id === button.id)
        : null
      if (objection?.response) {
        setIsTyping(true)
        await sleep(700)
        setIsTyping(false)
        addMessage({
          type: 'assistant',
          content: renderText(objection.response, variables),
          nodeId,
          nodeType: 'objection',
        })
      }
    }

    if (currentNode?.type === 'product_plan') {
      const plan = Array.isArray(currentNode.config.plans)
        ? currentNode.config.plans.find((item: any) => item.id === button.id)
        : null
      if (plan) {
        trackChatEvent('PlanSelected', {
          node_id: nodeId,
          plan_id: plan.id,
          plan_name: plan.plan_name || plan.label,
          plan_price: plan.price,
          product_id: plan.product_id,
        })
        const nextVars = {
          ...variables,
          'plan.name': plan.plan_name || plan.label,
          'plan.price': plan.price,
          'product.id': plan.product_id,
        }
        setVariables(nextVars)
        setState(prev => prev ? { ...prev, variables: nextVars } : prev)
      }
    }

    const targetNode = currentNode
      ? getNextNode(currentNode, edges, nodes, { buttonId: button.id })
      : null

    if (targetNode) {
      await sleep(300)
      await processNode(targetNode)
    }
  }, [addMessage, nodes, edges, processNode, trackChatEvent, variables, renderText])

  const handleInputSubmit = useCallback(async () => {
    if (!waitingInput || !inputValue.trim()) return
    const node = waitingInput
    const value = inputValue.trim()
    const varName = node.config.variable_name || 'input'

    addMessage({ type: 'user', content: value })
    trackChatEvent('Lead', { node_id: node.id, variable_name: varName, input_type: node.config.input_type })
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
  }, [waitingInput, inputValue, variables, addMessage, nodes, edges, processNode, trackChatEvent])

  const handleCheckoutSubmit = useCallback(async (customerData: {
    name: string; email: string; whatsapp?: string
  }, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

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
    } else if (node) {
      const nextNode = getNextNode(node, edges, nodes)
      if (nextNode) {
        await sleep(500)
        await processNode(nextNode)
      }
    }
  }, [nodes, edges, processNode])

  const handleDeliveryFetch = useCallback(async (nodeId: string) => {
    if (!orderId || !state?.session_id) return null
    try {
      const res = await fetch(`/api/orders/${orderId}/delivery?session_id=${state.session_id}`)
      if (!res.ok) return null
      const data = await res.json()
      setDeliveryPayload(data.payload)
      if (data.status === 'delivered' || data.status === 'manual_pending') {
        trackChatEvent('DeliveryCompleted', { node_id: nodeId, delivery_status: data.status })
      }
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        const handle = data.status === 'delivered'
          ? 'success'
          : data.status === 'manual_pending'
            ? 'out_of_stock'
            : 'error'
        const nextNode = getNextNode(node, edges, nodes, { handle })
        if (nextNode) {
          await sleep(500)
          await processNode(nextNode)
        }
      }
      return data.payload
    } catch {
      return null
    }
  }, [orderId, state?.session_id, nodes, edges, processNode, trackChatEvent])

  const header = <ChatHeader page={page} theme={theme} template={template} />
  const inputBar = (
    <ChatInputBar
      value={inputValue}
      onChange={setInputValue}
      onSend={handleInputSubmit}
      active={!!waitingInput}
      type={waitingInput?.config.input_type || 'text'}
      placeholder={waitingInput?.config.placeholder || 'Digite uma mensagem'}
      template={template}
    />
  )

  if (nodes.length === 0) {
    return (
      <ChatLayout theme={theme} template={template} header={header} inputBar={inputBar} customCss={page.custom_css}>
        <MessageBubble
          message={{ id: 'empty', type: 'assistant', content: 'Esta conversa ainda n\u00e3o tem um fluxo publicado.', timestamp: Date.now() }}
          theme={theme}
          avatarUrl={page.avatar_url}
          isUser={false}
        />
      </ChatLayout>
    )
  }

  if (!state) {
    return (
      <ChatLayout theme={theme} template={template} header={header} inputBar={inputBar} customCss={page.custom_css}>
        <TypingIndicator theme={theme} avatarUrl={page.avatar_url} />
      </ChatLayout>
    )
  }

  return (
    <ChatLayout
      theme={theme}
      template={template}
      header={page.show_header ? header : null}
      inputBar={inputBar}
      customCss={page.custom_css}
    >
        {state.visible_messages.map(msg => {
          const index = state.visible_messages.indexOf(msg)
          const prev = state.visible_messages[index - 1]
          const next = state.visible_messages[index + 1]
          const isUser = msg.type === 'user'
          const prevSame = prev && prev.type === msg.type && (msg.type === 'assistant' || msg.type === 'user')
          const nextSame = next && next.type === msg.type && (msg.type === 'assistant' || msg.type === 'user')

          if (msg.type === 'assistant' || msg.type === 'user') {
            return (
              <MessageBubble
                key={msg.id}
                message={msg.content ? { ...msg, content: renderText(msg.content, variables) } : msg}
                theme={theme}
                avatarUrl={page.avatar_url}
                isUser={isUser}
                showAvatar={!prevSame}
                compact={!!prevSame || !!nextSame}
              />
            )
          }

          if (msg.type === 'media') {
            return (
              <MediaMessageBubble
                key={msg.id}
                message={msg.content ? { ...msg, content: renderText(msg.content, variables) } : msg}
                theme={theme}
                avatarUrl={page.avatar_url}
                showAvatar={!prevSame}
                compact={!!prevSame || !!nextSame}
              />
            )
          }

          if (msg.type === 'buttons') {
            return (
              <QuickReplyButtons
                key={msg.id}
                buttons={renderButtons(msg.buttons || [], variables)}
                onSelect={(button) => handleButtonClick(button, msg.nodeId || '')}
              />
            )
          }

          if (msg.type === 'checkout') {
            return (
              <ConversationalFormFlow
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
    </ChatLayout>
  )
}
