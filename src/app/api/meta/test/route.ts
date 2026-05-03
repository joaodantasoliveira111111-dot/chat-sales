import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMetaCapiEvent } from '@/lib/meta/capi'
import { generateMetaEventId } from '@/lib/meta/events'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const eventId = generateMetaEventId('PageView', { session_id: `test_${Date.now()}` })
  const result = await sendMetaCapiEvent({
    tenantId: user.id,
    eventName: 'PageView',
    eventId,
    request,
    session: {
      session_id: `test_${Date.now()}`,
      landing_page_url: process.env.NEXT_PUBLIC_APP_URL || request.url,
    },
    customData: {
      test: true,
      event_source_url: process.env.NEXT_PUBLIC_APP_URL || request.url,
    },
    eventSourceUrl: process.env.NEXT_PUBLIC_APP_URL || request.url,
    source: 'server',
  })

  return NextResponse.json({ ok: result.ok, result })
}
