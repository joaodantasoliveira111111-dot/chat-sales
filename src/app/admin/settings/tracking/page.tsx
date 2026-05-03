import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/middleware'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { TrackingSettingsContent } from './TrackingSettingsContent'

export default async function TrackingSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const admin = createAdminClient()
  const [{ data: settings }, { data: events }] = await Promise.all([
    admin.from('meta_tracking_settings').select('*').eq('user_id', user.id).maybeSingle(),
    admin.from('tracking_events').select('*').eq('tenant_id', user.id).order('created_at', { ascending: false }).limit(50),
  ])

  return (
    <AdminLayout>
      <TrackingSettingsContent initialSettings={settings} events={events || []} />
    </AdminLayout>
  )
}
