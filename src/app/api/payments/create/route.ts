import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { getPaymentProvider } from '@/lib/payment'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const createPaymentSchema = z.object({
  product_id: z.string().uuid(),
  page_id: z.string().uuid().optional(),
  flow_id: z.string().uuid().optional(),
  session_id: z.string(),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_whatsapp: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { product_id, page_id, flow_id, session_id, customer_name, customer_email, customer_whatsapp } = parsed.data
    const supabase = createAdminClient()

    // Validate product is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'active')
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado ou inativo' }, { status: 404 })
    }

    // Get page owner
    let userId = null
    if (page_id) {
      const { data: page } = await supabase.from('public_pages').select('user_id').eq('id', page_id).single()
      userId = page?.user_id
    }
    if (!userId) {
      userId = product.user_id
    }

    // Create order
    const orderId = uuidv4()
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`

    // Create PIX payment
    const { provider, providerName } = await getPaymentProvider(userId)
    const pixResult = await provider.createPixPayment({
      orderId,
      amount: product.price,
      customerName: customer_name,
      customerEmail: customer_email,
      description: product.name,
      webhookUrl,
    })

    // Save order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        product_id,
        page_id: page_id || null,
        flow_id: flow_id || null,
        session_id,
        customer_name,
        customer_email,
        customer_whatsapp: customer_whatsapp || null,
        amount: product.price,
        currency: product.currency || 'BRL',
        status: 'pending',
        payment_provider: providerName,
        gateway_payment_id: pixResult.gatewayPaymentId,
        pix_code: pixResult.pixCode,
        pix_qr_code_url: pixResult.pixQrCodeUrl || null,
        pix_qr_code_base64: pixResult.pixQrCodeBase64 || null,
        expires_at: pixResult.expiresAt?.toISOString() || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order insert error:', orderError)
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    // Track event
    await trackEvent('GeneratePix', {
      page_id,
      product_id,
      flow_id,
      order_id: orderId,
      session_id,
      user_id: userId,
    })

    return NextResponse.json({
      order_id: orderId,
      pix_code: pixResult.pixCode,
      pix_qr_code_url: pixResult.pixQrCodeUrl,
      pix_qr_code_base64: pixResult.pixQrCodeBase64,
      expires_at: pixResult.expiresAt?.toISOString(),
      amount: product.price,
      status: 'pending',
    })
  } catch (err) {
    console.error('Create payment error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
