import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AnalyticsDashboardContent } from './AnalyticsDashboardContent'

export default async function AnalyticsDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <AnalyticsDashboardContent userId={user.id} />
    </AdminLayout>
  )
}
