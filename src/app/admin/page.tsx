import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DashboardContent } from './DashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Fetch dashboard metrics
  const [
    { count: totalOrders },
    { count: paidOrders },
    { count: pendingOrders },
    { count: activeProducts },
    { count: publishedPages },
    { count: availableStock },
    { count: deliveries },
    { data: revenue },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['paid', 'delivered']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
    supabase.from('public_pages').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'published'),
    supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'available'),
    supabase.from('deliveries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('orders').select('amount').eq('user_id', user.id).in('status', ['paid', 'delivered']),
  ])

  const totalRevenue = revenue?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0

  const metrics = {
    totalOrders: totalOrders || 0,
    paidOrders: paidOrders || 0,
    pendingOrders: pendingOrders || 0,
    activeProducts: activeProducts || 0,
    publishedPages: publishedPages || 0,
    availableStock: availableStock || 0,
    deliveries: deliveries || 0,
    totalRevenue,
  }

  // Checklist progress
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: flowCount } = await supabase.from('flows').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: inventoryCount } = await supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

  const checklist = {
    hasProduct: (productCount || 0) > 0,
    hasPage: (publishedPages || 0) > 0 || ((await supabase.from('public_pages').select('*', { count: 'exact', head: true }).eq('user_id', user.id)).count || 0) > 0,
    hasFlow: (flowCount || 0) > 0,
    hasInventory: (inventoryCount || 0) > 0,
    hasPayment: false, // will check settings
  }

  return (
    <AdminLayout>
      <DashboardContent metrics={metrics} checklist={checklist} />
    </AdminLayout>
  )
}
