import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { OrdersContent } from './OrdersContent'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, product:products(name), delivery:deliveries(id, delivered_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <AdminLayout>
      <OrdersContent orders={orders || []} />
    </AdminLayout>
  )
}
