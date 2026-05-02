import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PaymentSettingsContent } from './PaymentSettingsContent'

export default async function PaymentSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <PaymentSettingsContent
        userId={user.id}
        currentProvider={process.env.PAYMENT_PROVIDER || 'mock'}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || ''}
      />
    </AdminLayout>
  )
}
