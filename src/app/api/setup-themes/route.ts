import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { isMissingServiceRoleError, missingServiceRoleResponse } from '@/lib/supabase/admin-error'
import { systemThemes } from '@/lib/themes/systemThemes'

export async function GET() {
  try {
    const supabase = createAdminClient()
    let successes = 0
    const errors = []

    for (const theme of systemThemes) {
      const { error } = await supabase.from('themes').upsert(theme, { onConflict: 'id' })

      if (error) {
        errors.push({ id: theme.id, error })
      } else {
        successes++
      }
    }

    return NextResponse.json({ successes, errors })
  } catch (err) {
    if (isMissingServiceRoleError(err)) return missingServiceRoleResponse()
    console.error('Theme setup error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
