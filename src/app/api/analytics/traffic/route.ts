import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const url = new URL(request.url)
    const period = url.searchParams.get('days') || '30'
    let startDate: Date
    let endDate: Date | undefined

    if (period === 'hoje') {
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'ontem') {
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const days = parseInt(period)
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    // Get tracking sessions with traffic data
    let query = admin
      .from('tracking_sessions')
      .select('*')
      .eq('tenant_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data: sessions } = await query

    if (!sessions) {
      return NextResponse.json({
        utmSources: [],
        referrers: [],
        totalSessions: 0,
      })
    }

    // Aggregate UTM sources
    const utmSourceCounts = new Map<string, number>()
    sessions.forEach(session => {
      const source = session.utm_source || 'direct'
      utmSourceCounts.set(source, (utmSourceCounts.get(source) || 0) + 1)
    })

    const utmSources = Array.from(utmSourceCounts.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Aggregate referrers
    const referrerCounts = new Map<string, number>()
    sessions.forEach(session => {
      const referrer = session.referrer || 'direct'
      // Clean up referrer URLs
      const cleanReferrer = referrer.startsWith('http')
        ? new URL(referrer).hostname
        : referrer
      referrerCounts.set(cleanReferrer, (referrerCounts.get(cleanReferrer) || 0) + 1)
    })

    const referrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      utmSources,
      referrers,
      totalSessions: sessions.length,
    })
  } catch (error) {
    console.error('[analytics/traffic] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
