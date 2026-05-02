import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { FlowsContent } from './FlowsContent'

export default async function FlowsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: flows } = await supabase
    .from('flows')
    .select('*, product:products(name)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('status', 'active')

  return (
    <AdminLayout>
      <FlowsContent flows={flows || []} products={products || []} userId={user.id} />
    </AdminLayout>
  )
}
