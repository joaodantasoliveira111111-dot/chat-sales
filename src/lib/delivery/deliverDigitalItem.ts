import { createAdminClient } from '@/lib/supabase/middleware'
import { DeliveryPayload, FlowNodeConfig } from '@/types'
import { interpolateTemplate } from '@/lib/utils'

const defaultAccountTemplate = `Pagamento aprovado ✅

Aqui está seu acesso:

Login: {{account.login}}
Senha: {{account.password}}

Guarde esses dados com segurança.`

const defaultOutOfStockMessage = `Pagamento aprovado ✅

No momento estamos liberando seu acesso manualmente. Nossa equipe vai te chamar em alguns minutos.`

export async function deliverDigitalItem(orderId: string): Promise<{
  success: boolean
  deliveryId?: string
  error?: string
  pendingStock?: boolean
  manualPending?: boolean
}> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('id', orderId)
    .single()

  if (orderError || !order) return { success: false, error: 'Order not found' }
  if (!['paid', 'delivered', 'paid_pending_stock', 'pending_delivery', 'manual_pending'].includes(order.status)) {
    return { success: false, error: `Order status is ${order.status}, not deliverable` }
  }

  const { data: existingDelivery } = await supabase
    .from('deliveries')
    .select('id, status')
    .eq('order_id', orderId)
    .maybeSingle()

  if (existingDelivery?.status === 'delivered' || existingDelivery?.status === 'manual_pending') {
    return { success: true, deliveryId: existingDelivery.id, manualPending: existingDelivery.status === 'manual_pending' }
  }

  const config = await resolveDeliveryConfig(order.flow_id)
  const deliveryType = normalizeDeliveryType(config.delivery_type || order.product?.delivery_type || 'account_credentials')
  const productId = String(config.inventory_product_id || config.product_id || order.product_id || '')

  if (!productId) return { success: false, error: 'Order has no product associated' }

  const baseVariables = {
    lead: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_whatsapp,
    },
    order: {
      id: order.id,
      amount: Number(order.amount || 0),
    },
    product: {
      name: order.product?.name,
      price: Number(order.product?.price || order.amount || 0),
    },
    payment: {
      status: order.status,
    },
  }

  if (deliveryType === 'account_credentials') {
    const statusAfterDelivery = String(config.inventory_status_after_delivery || 'delivered')
    const { data: claimed, error: claimError } = await supabase.rpc('claim_available_inventory_item', {
      p_order_id: order.id,
      p_user_id: order.user_id,
      p_product_id: productId,
      p_status: statusAfterDelivery,
      p_lead_id: order.session_id,
    })

    if (claimError) {
      await createFailedDelivery(order, deliveryType, `Inventory claim failed: ${claimError.message}`)
      return { success: false, error: 'Failed to claim inventory item' }
    }

    if (!claimed) {
      const payload = buildPayload({
        config,
        order,
        deliveryType,
        variables: {
          ...baseVariables,
          delivery: { button_text: String(config.button_text || '') },
        },
        renderedMessage: interpolateTemplate(String(config.out_of_stock_message || defaultOutOfStockMessage), baseVariables),
      })

      const delivery = await upsertDelivery({
        order,
        status: 'manual_pending',
        deliveryType,
        payload,
        errorMessage: 'No inventory available',
      })

      await supabase.from('orders').update({
        status: 'manual_pending',
        updated_at: now,
      }).eq('id', order.id)

      return { success: true, deliveryId: delivery?.id, pendingStock: true, manualPending: true }
    }

    const account = {
      login: claimed.access_email || claimed.email || claimed.title || '',
      password: claimed.access_password || claimed.password || '',
      email: claimed.access_email || claimed.email || '',
      extra_info: claimed.extra_instructions || stringifyExtra(claimed.extra_data),
    }
    const variables = {
      ...baseVariables,
      account,
      delivery: { button_text: String(config.button_text || '') },
    }
    const renderedMessage = interpolateTemplate(String(config.delivery_template || defaultAccountTemplate), variables)
    const payload = buildPayload({
      config,
      order,
      deliveryType,
      variables,
      renderedMessage,
      inventoryItem: claimed,
    })

    const delivery = await upsertDelivery({
      order,
      status: 'delivered',
      deliveryType,
      payload,
      inventoryItemId: claimed.id,
    })

    await supabase.from('orders').update({
      status: 'delivered',
      delivered_at: now,
      updated_at: now,
    }).eq('id', order.id)

    return { success: true, deliveryId: delivery?.id }
  }

  const payload = buildStaticDeliveryPayload(config, order, deliveryType, baseVariables)
  const status = deliveryType === 'manual_access' ? 'manual_pending' : 'delivered'
  const delivery = await upsertDelivery({
    order,
    status,
    deliveryType,
    payload,
  })

  await supabase.from('orders').update({
    status: status === 'manual_pending' ? 'manual_pending' : 'delivered',
    delivered_at: status === 'delivered' ? now : null,
    updated_at: now,
  }).eq('id', order.id)

  return { success: true, deliveryId: delivery?.id, manualPending: status === 'manual_pending' }
}

async function resolveDeliveryConfig(flowId: string | null): Promise<FlowNodeConfig> {
  if (!flowId) return {}
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('flow_nodes')
    .select('config')
    .eq('flow_id', flowId)
    .eq('type', 'delivery')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (data?.config || {}) as FlowNodeConfig
}

function normalizeDeliveryType(type: unknown) {
  const value = String(type || 'account_credentials')
  if (value === 'digital_credential') return 'account_credentials'
  if (value === 'file') return 'digital_file'
  if (value === 'link') return 'external_link'
  if (value === 'custom_text') return 'custom_message'
  if (value === 'manual') return 'manual_access'
  return value
}

function buildStaticDeliveryPayload(
  config: FlowNodeConfig,
  order: any,
  deliveryType: string,
  baseVariables: Record<string, unknown>
): DeliveryPayload {
  const link = String(config.community_link || config.access_link || config.file_link || config.external_url || '')
  const buttonText = String(config.button_text || defaultButtonText(deliveryType))
  const variables = {
    ...baseVariables,
    delivery: { link, button_text: buttonText },
  }
  const template = String(config.delivery_template || config.manual_message || defaultMessageFor(deliveryType))
  return buildPayload({
    config,
    order,
    deliveryType,
    variables,
    renderedMessage: interpolateTemplate(template, variables),
    link,
    buttonText,
  })
}

function buildPayload({
  config,
  order,
  deliveryType,
  variables,
  renderedMessage,
  inventoryItem,
  link,
  buttonText,
}: {
  config: FlowNodeConfig
  order: any
  deliveryType: string
  variables: Record<string, unknown>
  renderedMessage: string
  inventoryItem?: any
  link?: string
  buttonText?: string
}): DeliveryPayload {
  const account = (variables.account || {}) as Record<string, unknown>
  const delivery = (variables.delivery || {}) as Record<string, unknown>
  return {
    product_name: order.product?.name,
    customer_name: order.customer_name,
    order_id: order.id,
    delivery_type: deliveryType as DeliveryPayload['delivery_type'],
    rendered_message: renderedMessage,
    access_email: String(account.email || account.login || inventoryItem?.access_email || ''),
    access_password: String(account.password || inventoryItem?.access_password || ''),
    access_url: link || String(delivery.link || config.access_link || config.community_link || config.file_link || config.external_url || inventoryItem?.access_url || ''),
    custom_content: String(config.content_description || config.custom_content || config.additional_instructions || ''),
    extra_instructions: String(config.additional_instructions || config.release_deadline || config.support_contact || ''),
    button_text: buttonText || String(delivery.button_text || config.button_text || defaultButtonText(deliveryType)),
    button_url: link || String(delivery.link || config.access_link || config.community_link || config.file_link || config.external_url || ''),
    account,
    lead: (variables.lead || {}) as DeliveryPayload['lead'],
    order: (variables.order || {}) as DeliveryPayload['order'],
    product: (variables.product || {}) as DeliveryPayload['product'],
    payment: (variables.payment || {}) as DeliveryPayload['payment'],
    delivery: (variables.delivery || {}) as DeliveryPayload['delivery'],
  }
}

async function upsertDelivery({
  order,
  status,
  deliveryType,
  payload,
  inventoryItemId,
  errorMessage,
}: {
  order: any
  status: 'pending' | 'delivered' | 'failed' | 'manual_pending'
  deliveryType: string
  payload: DeliveryPayload
  inventoryItemId?: string
  errorMessage?: string
}) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('deliveries')
    .upsert({
      user_id: order.user_id,
      order_id: order.id,
      lead_id: order.session_id,
      product_id: order.product_id,
      inventory_item_id: inventoryItemId || null,
      delivery_type: deliveryType,
      delivery_payload: payload,
      status,
      error_message: errorMessage || null,
      delivered_at: status === 'delivered' ? now : null,
      updated_at: now,
    }, { onConflict: 'order_id' })
    .select('id')
    .single()
  return data
}

async function createFailedDelivery(order: any, deliveryType: string, errorMessage: string) {
  await upsertDelivery({
    order,
    status: 'failed',
    deliveryType,
    payload: { order_id: order.id, delivery_type: deliveryType as DeliveryPayload['delivery_type'], error_message: errorMessage },
    errorMessage,
  })
}

function defaultButtonText(deliveryType: string) {
  if (deliveryType === 'community_link') return 'Entrar na comunidade'
  if (deliveryType === 'digital_file') return 'Baixar material'
  if (deliveryType === 'course') return 'Acessar curso'
  if (deliveryType === 'external_link' || deliveryType === 'exclusive_content') return 'Acessar agora'
  return ''
}

function defaultMessageFor(deliveryType: string) {
  if (deliveryType === 'community_link') {
    return 'Pagamento aprovado ✅\n\nSeu acesso à comunidade foi liberado.\n\nClique abaixo para entrar:\n{{delivery.link}}'
  }
  if (deliveryType === 'exclusive_content') {
    return 'Pagamento aprovado ✅\n\nSeu conteúdo exclusivo foi liberado.\n\nAcesse por aqui: {{delivery.link}}'
  }
  if (deliveryType === 'course') {
    return 'Pagamento aprovado ✅\n\nSeu curso foi liberado.\n\nAcesse por aqui: {{delivery.link}}'
  }
  if (deliveryType === 'digital_file') {
    return 'Pagamento aprovado ✅\n\nSeu material digital está pronto.\n\nBaixe aqui: {{delivery.link}}'
  }
  if (deliveryType === 'manual_access') {
    return defaultOutOfStockMessage
  }
  return 'Pagamento aprovado ✅\n\nSeu acesso foi liberado: {{delivery.link}}'
}

function stringifyExtra(extra: unknown) {
  if (!extra) return ''
  if (typeof extra === 'string') return extra
  try {
    return JSON.stringify(extra)
  } catch {
    return ''
  }
}
