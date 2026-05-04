import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW = 60_000

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id é obrigatório' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(`${ip}:${sessionId}`)) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente em instantes.' }, { status: 429 })
    }

    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, paid_at, delivered_at, expires_at, amount, customer_name, session_id')
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.session_id !== sessionId) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 403 })
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
