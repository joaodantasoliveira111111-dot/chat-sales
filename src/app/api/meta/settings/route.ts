import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { encryptSecret } from '@/lib/meta/crypto'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('meta_tracking_settings')
    .select('pixel_id,dataset_id,test_event_code,verified_domain,business_name,is_enabled,browser_tracking_enabled,server_tracking_enabled,advanced_matching_enabled,deduplication_enabled,last_event_at,last_event_name,last_event_status,access_token_encrypted')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    settings: data ? {
      ...data,
      access_token_encrypted: undefined,
      has_access_token: !!data.access_token_encrypted,
    } : null,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()
  const update: Record<string, unknown> = {
    user_id: user.id,
    pixel_id: clean(body.pixel_id),
    dataset_id: clean(body.dataset_id),
    test_event_code: clean(body.test_event_code),
    verified_domain: clean(body.verified_domain),
    business_name: clean(body.business_name),
    is_enabled: !!body.is_enabled,
    browser_tracking_enabled: body.browser_tracking_enabled !== false,
    server_tracking_enabled: body.server_tracking_enabled !== false,
    advanced_matching_enabled: body.advanced_matching_enabled !== false,
    deduplication_enabled: body.deduplication_enabled !== false,
    updated_at: new Date().toISOString(),
  }
  if (typeof body.access_token === 'string' && body.access_token.trim()) {
    update.access_token_encrypted = encryptSecret(body.access_token.trim())
  }

  const { error } = await admin
    .from('meta_tracking_settings')
    .upsert(update, { onConflict: 'user_id' })

  if (error) {
    console.error('[meta-settings] save error', error)
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function clean(value: unknown) {
  const text = String(value || '').trim()
  return text || null
}
