import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, paid_at, delivered_at, expires_at, amount, customer_name')
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Validate session if provided
    if (sessionId) {
      const { data: fullOrder } = await supabase
        .from('orders')
        .select('session_id')
        .eq('id', id)
        .single()
      
      if (fullOrder && fullOrder.session_id !== sessionId) {
        return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
      }
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      paid_at: order.paid_at,
      delivered_at: order.delivered_at,
      expires_at: order.expires_at,
      amount: order.amount,
      customer_name: order.customer_name,
    })
  } catch (err) {
    console.error('Order status error:', err)
    if (isMissingServiceRoleError(err)) return missingServiceRoleResponse()
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
