import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { getPaymentProvider } from '@/lib/payment'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { sendMetaCapiEvent } from '@/lib/meta/capi'
import { generateMetaEventId } from '@/lib/meta/events'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'

const createPaymentSchema = z.object({
  product_id: z.string().uuid(),
  page_id: z.string().uuid().optional(),
  flow_id: z.string().uuid().optional(),
  session_id: z.string(),
  customer_name: z.string().min(1),
  customer_email: z.string().email().or(z.literal('')).optional(),
  customer_whatsapp: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createPaymentSchema.safeParse(body)

    if (!parsed.success) {
      console.error('[payments/create] validation error:', parsed.error.flatten())
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { product_id, page_id, flow_id, session_id, customer_name, customer_email, customer_whatsapp } = parsed.data
    const supabase = createAdminClient()

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      console.error('[payments/create] product error:', productError)
      return NextResponse.json({ error: 'Produto não encontrado ou inativo' }, { status: 404 })
    }

    let userId: string = product.user_id
    if (page_id) {
      const { data: page } = await supabase.from('public_pages').select('user_id').eq('id', page_id).single()
      if (page?.user_id) userId = page.user_id
    }

    const orderId = uuidv4()

    const { data: webhookSecretData } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'webhook_secret')
      .single()
    const webhookSecret = (webhookSecretData?.value as any)?.secret || ''
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook?u=${userId}${webhookSecret ? `&s=${webhookSecret}` : ''}`

    const { provider, providerName } = await getPaymentProvider(userId)

    let pixResult
    try {
      pixResult = await provider.createPixPayment({
        orderId,
        amount: product.price,
        customerName: customer_name || 'Cliente',
        customerEmail: customer_email || 'cliente@chatfy.com',
        customerPhone: customer_whatsapp || '',
        description: product.name,
        webhookUrl,
      })
    } catch (pixError: any) {
      console.error('[payments/create] PIX creation failed:', pixError?.message || pixError)
      return NextResponse.json(
        { error: `Erro ao gerar PIX: ${pixError?.message || 'Erro desconhecido'}` },
        { status: 502 }
      )
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        product_id,
        page_id: page_id || null,
        flow_id: flow_id || null,
        session_id,
        customer_name: customer_name || 'Cliente',
        customer_email: customer_email || null,
        customer_whatsapp: customer_whatsapp || null,
        amount: product.price,
        currency: product.currency || 'BRL',
        status: 'pending',
        payment_provider: providerName,
        gateway_payment_id: pixResult.gatewayPaymentId,
        pix_code: pixResult.pixCode,
        pix_qr_code_url: pixResult.pixQrCodeUrl || null,
        expires_at: pixResult.expiresAt?.toISOString() || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('[payments/create] order insert error:', orderError)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    // Non-critical: update tracking session
    supabase.from('tracking_sessions').update({
      order_id: orderId,
      lead_id: session_id,
      updated_at: new Date().toISOString(),
    }).eq('tenant_id', userId).eq('session_id', session_id).then(() => {})

    // Non-critical: track events
    trackEvent('AddPaymentInfo', {
      page_id, product_id, flow_id, order_id: orderId, session_id, user_id: userId,
    }).catch(() => {})

    const { data: trackingSession } = await supabase
      .from('tracking_sessions')
      .select('*')
      .eq('tenant_id', userId)
      .eq('session_id', session_id)
      .maybeSingle()

    const leadData = {
      name: customer_name || 'Cliente',
      email: customer_email || undefined,
      phone: customer_whatsapp,
      external_id: session_id,
    }

    const customData = {
      order_id: orderId,
      product_id,
      page_id,
      flow_id,
      session_id,
      content_ids: [product_id],
      content_name: product.name,
      value: product.price,
      currency: product.currency || 'BRL',
    }

    sendMetaCapiEvent({
      tenantId: userId,
      eventName: 'InitiateCheckout',
      eventId: generateMetaEventId('InitiateCheckout', { order_id: orderId, session_id }),
      request,
      session: trackingSession || { session_id, page_id, product_id, flow_id, order_id: orderId },
      lead: leadData,
      customData,
      eventSourceUrl: String(trackingSession?.landing_page_url || ''),
      source: 'server',
    }).catch(() => {})

    sendMetaCapiEvent({
      tenantId: userId,
      eventName: 'AddPaymentInfo',
      eventId: generateMetaEventId('AddPaymentInfo', { order_id: orderId, session_id }),
      request,
      session: trackingSession || { session_id, page_id, product_id, flow_id, order_id: orderId },
      lead: { ...leadData },
      customData: { ...customData, payment_method: 'pix' },
      eventSourceUrl: String(trackingSession?.landing_page_url || ''),
      source: 'server',
    }).catch(() => {})

    return NextResponse.json({
      order_id: orderId,
      pix_code: pixResult.pixCode,
      pix_qr_code_url: pixResult.pixQrCodeUrl,
      expires_at: pixResult.expiresAt?.toISOString(),
      amount: product.price,
      status: 'pending',
    })
  } catch (err) {
    console.error('[payments/create] unhandled error:', err)
    if (isMissingServiceRoleError(err)) return missingServiceRoleResponse()
    const message = err instanceof Error ? err.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
