import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { getPaymentProvider } from '@/lib/payment'
import { deliverDigitalItem } from '@/lib/delivery/deliverDigitalItem'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { sendMetaCapiEvent } from '@/lib/meta/capi'
import { generateMetaEventId } from '@/lib/meta/events'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'

export async function POST(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('u')
    if (!userId) {
      return NextResponse.json({ error: 'Missing user id in webhook URL' }, { status: 400 })
    }

    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())
    const supabase = createAdminClient()
    const { provider, providerName } = await getPaymentProvider(userId)

    // Save raw webhook event
    await supabase.from('payment_events').insert({
      user_id: userId,
      provider: providerName,
      event_type: body.event || body.status || 'unknown',
      payload: body,
    })

    // Handle webhook
    const result = await provider.handleWebhook(body, headers)

    if (!result.gatewayPaymentId && !body.order_id) {
      return NextResponse.json({ received: true })
    }

    // Find order
    let order = null

    if (result.gatewayPaymentId) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('gateway_payment_id', result.gatewayPaymentId)
        .single()
      order = data
    }

    if (!order && body.order_id) {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', body.order_id)
        .single()
      order = data
    }

    if (!order) {
      return NextResponse.json({ received: true, note: 'Order not found' })
    }

    // Update payment_events with order_id
    await supabase.from('payment_events').update({ order_id: order.id, user_id: order.user_id })
      .eq('provider', providerName)
      .is('order_id', null)
      .order('received_at', { ascending: false })
      .limit(1)

    if (result.status === 'paid' && order.status === 'pending') {
      // Mark as paid
      await supabase.from('orders').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)

      // Track purchase event
      await trackEvent('Purchase', {
        order_id: order.id,
        product_id: order.product_id,
        page_id: order.page_id,
        flow_id: order.flow_id,
        session_id: order.session_id,
        user_id: order.user_id,
      })

      const [{ data: trackingSession }, { data: product }] = await Promise.all([
        supabase
          .from('tracking_sessions')
          .select('*')
          .eq('tenant_id', order.user_id)
          .eq('session_id', order.session_id)
          .maybeSingle(),
        order.product_id
          ? supabase.from('products').select('name,currency').eq('id', order.product_id).maybeSingle()
          : Promise.resolve({ data: null } as any),
      ])

      await sendMetaCapiEvent({
        tenantId: order.user_id,
        eventName: 'Purchase',
        eventId: generateMetaEventId('Purchase', { order_id: order.id, session_id: order.session_id }),
        request,
        session: trackingSession || {
          session_id: order.session_id,
          page_id: order.page_id,
          product_id: order.product_id,
          flow_id: order.flow_id,
          order_id: order.id,
        },
        lead: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_whatsapp,
          external_id: order.session_id,
        },
        customData: {
          order_id: order.id,
          product_id: order.product_id,
          page_id: order.page_id,
          flow_id: order.flow_id,
          session_id: order.session_id,
          content_ids: order.product_id ? [order.product_id] : undefined,
          content_name: product?.name,
          value: Number(order.amount),
          currency: order.currency || product?.currency || 'BRL',
          payment_method: 'pix',
        },
        eventSourceUrl: String(trackingSession?.landing_page_url || ''),
        source: 'server',
      })

      // Auto-deliver
      const deliveryResult = await deliverDigitalItem(order.id)

      if (deliveryResult.success) {
        await trackEvent('DeliveryCompleted', {
          order_id: order.id,
          product_id: order.product_id,
          page_id: order.page_id,
          flow_id: order.flow_id,
          session_id: order.session_id,
          user_id: order.user_id,
        })
      }
    } else if (result.status === 'expired' && order.status === 'pending') {
      await supabase.from('orders').update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    } else if (result.status === 'cancelled') {
      await supabase.from('orders').update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    if (isMissingServiceRoleError(err)) return missingServiceRoleResponse()
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
