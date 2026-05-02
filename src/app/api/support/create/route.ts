import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const schema = z.object({
  order_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  customer_name: z.string().optional(),
  customer_email: z.string().email().optional(),
  customer_whatsapp: z.string().optional(),
  message: z.string().min(5),
  user_id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('support_requests')
      .insert({
        id: uuidv4(),
        ...parsed.data,
        status: 'open',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar solicitação' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id, created: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
