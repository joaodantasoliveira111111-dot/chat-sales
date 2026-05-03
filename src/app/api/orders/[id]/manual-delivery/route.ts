import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { deliverDigitalItem } from '@/lib/delivery/deliverDigitalItem'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'

// Admin: simulate payment approval (mock mode)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()

    // Get order (must belong to this admin)
    const { data: order, error } = await adminSupabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: `Pedido está com status: ${order.status}` }, { status: 400 })
    }

    // Mark as paid
    await adminSupabase.from('orders').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    // Trigger delivery
    const deliveryResult = await deliverDigitalItem(id)

    return NextResponse.json({
      success: true,
      delivered: deliveryResult.success,
      pending_stock: deliveryResult.pendingStock,
      delivery_id: deliveryResult.deliveryId,
    })
  } catch (err) {
    console.error('Manual delivery error:', err)
    if (isMissingServiceRoleError(err)) return missingServiceRoleResponse()
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
