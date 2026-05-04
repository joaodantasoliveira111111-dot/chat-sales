import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { OrdersContent } from './OrdersContent'

const PAGE_SIZE = 20

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: orders, count } = await supabase
    .from('orders')
    .select('*, product:products(name), delivery:deliveries(id, delivered_at)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <AdminLayout>
      <OrdersContent
        orders={orders || []}
        totalCount={count || 0}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </AdminLayout>
  )
}
