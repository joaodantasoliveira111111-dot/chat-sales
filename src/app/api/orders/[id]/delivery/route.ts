import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify order belongs to session and is paid/delivered
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, session_id, product_id')
      .eq('id', id)
      .eq('session_id', sessionId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (!['paid', 'delivered'].includes(order.status)) {
      return NextResponse.json({ error: 'Pagamento não confirmado' }, { status: 403 })
    }

    // Get delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('delivery_payload, delivered_at')
      .eq('order_id', id)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Entrega não encontrada' }, { status: 404 })
    }

    // Return only safe delivery payload (never return raw inventory item)
    return NextResponse.json({
      delivered: true,
      delivered_at: delivery.delivered_at,
      payload: delivery.delivery_payload,
    })
  } catch (err) {
    console.error('Delivery fetch error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
