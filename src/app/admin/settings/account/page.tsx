import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AccountSettingsContent } from './AccountSettingsContent'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <AccountSettingsContent
        userId={user.id}
        email={user.email || ''}
        initialName={user.user_metadata?.full_name || ''}
      />
    </AdminLayout>
  )
}
