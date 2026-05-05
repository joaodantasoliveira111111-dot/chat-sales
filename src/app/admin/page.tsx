import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DashboardContent } from './DashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [
    { count: totalOrders },
    { count: paidOrders },
    { count: pendingOrders },
    { count: expiredOrders },
  { count: activeProducts },
  { count: publishedPages },
  { count: availableStock },
  { count: lowStockItems },
  { count: deliveries },
  { data: revenue },
  { data: recentOrders },
  { count: openSupport },
  { data: metaSettings },
  { count: flowCount },
  { count: inventoryCount },
  { count: pageCount },
] = await Promise.all([
  supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['paid', 'delivered']),
  supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
  supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'expired'),
  supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'archived'),
  supabase.from('public_pages').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'published'),
  supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'available'),
  supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'available').lt('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
  supabase.from('deliveries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  supabase.from('orders').select('amount').eq('user_id', user.id).in('status', ['paid', 'delivered']),
  supabase.from('orders').select('id, customer_name, customer_email, amount, status, created_at, product:products(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  supabase.from('support_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'open'),
  supabase.from('admin_settings').select('value').eq('user_id', user.id).eq('key', 'meta_tracking').single(),
  supabase.from('flows').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('status', 'archived'),
  supabase.from('public_pages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const totalRevenue = revenue?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0
  const avgTicket = (paidOrders || 0) > 0 ? totalRevenue / (paidOrders || 1) : 0

  const metrics = {
    totalOrders: totalOrders || 0,
    paidOrders: paidOrders || 0,
    pendingOrders: pendingOrders || 0,
    expiredOrders: expiredOrders || 0,
    activeProducts: activeProducts || 0,
    publishedPages: publishedPages || 0,
    availableStock: availableStock || 0,
    lowStock: lowStockItems || 0,
    deliveries: deliveries || 0,
    totalRevenue,
    avgTicket,
    openSupport: openSupport || 0,
  }

  const checklist = {
    hasProduct: (activeProducts || 0) > 0,
    hasPage: (pageCount || 0) > 0,
    hasFlow: (flowCount || 0) > 0,
    hasInventory: (inventoryCount || 0) > 0,
    hasPayment: false,
  }

  const trackingHealth = {
    pixelConnected: !!(metaSettings?.value as any)?.pixel_id,
    capiConnected: !!(metaSettings?.value as any)?.access_token_encrypted,
    browserTracking: (metaSettings?.value as any)?.browser_tracking_enabled ?? false,
    serverTracking: (metaSettings?.value as any)?.server_tracking_enabled ?? false,
  }

  const normalizedOrders = (recentOrders || []).map((o: any) => ({
    ...o,
    product: Array.isArray(o.product) ? o.product[0] || null : o.product || null,
  }))

  return (
    <AdminLayout>
      <DashboardContent
        metrics={metrics}
        checklist={checklist}
        recentOrders={normalizedOrders}
        trackingHealth={trackingHealth}
      />
    </AdminLayout>
  )
}
