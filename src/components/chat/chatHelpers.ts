import { PublicPage, FlowNode, ChatMessage, ThemeConfig } from '@/types'
import { whatsappTheme } from './themes/whatsapp'
import { instagramTheme } from './themes/instagram'

export const textNodeTypes = ['text_message', 'message']
export const buttonNodeTypes = ['button_message', 'quick_reply']
export const inputNodeTypes = ['input', 'capture_input']
export const mediaNodeTypes = ['media_message', 'audio_message', 'video_message', 'image_message', 'file_message']

export function convertThemeToConfig(theme: typeof whatsappTheme | typeof instagramTheme): ThemeConfig {
  return {
    background: theme.colors.background,
    backgroundPattern: theme.colors.backgroundPattern,
    chatContainer: 'transparent',
    chatContainerBorder: 'transparent',
    assistantBubble: theme.colors.assistantBubble,
    assistantBubbleBorder: theme.colors.assistantBubbleBorder,
    assistantText: theme.colors.assistantText,
    userBubble: theme.colors.userBubble,
    userText: theme.colors.userText,
    button: theme.colors.button,
    buttonText: theme.colors.buttonText,
    buttonHover: theme.colors.buttonHover,
    headerBg: theme.colors.headerBg,
    headerText: theme.colors.headerText,
    inputBg: theme.colors.inputBg,
    inputBorder: theme.colors.inputBorder,
    inputText: theme.colors.inputText,
    scrollbar: theme.colors.scrollbar,
    typingDot: theme.colors.typingDot,
    borderRadius: theme.radius.bubble,
    bubbleRadius: theme.radius.bubble,
    shadow: 'none',
    fontFamily: theme.typography.fontFamily,
    backdropFilter: 'none',
    timestamp: theme.colors.timestamp,
  }
}

export function buildTemplateContext(page: PublicPage, nodes: FlowNode[], variables: Record<string, unknown>) {
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

export function hasRepeatedAssistantLoop(messages: ChatMessage[]) {
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
