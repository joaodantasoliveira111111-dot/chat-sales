import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { InventoryContent } from './InventoryContent'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: items }, { data: products }] = await Promise.all([
    supabase.from('inventory_items').select('*, product:products(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, delivery_type').eq('user_id', user.id).neq('status', 'archived'),
  ])

  return (
    <AdminLayout>
      <InventoryContent items={items || []} products={products || []} userId={user.id} />
    </AdminLayout>
  )
}
