import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { InventoryContent } from './InventoryContent'

const PAGE_SIZE = 20

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: items, count }, { data: products }] = await Promise.all([
supabase.from('inventory_items').select('*, product:products(name)', { count: 'exact' }).eq('user_id', user.id).neq('status', 'archived').order('created_at', { ascending: false }).range(from, to),
  supabase.from('products').select('id, name, delivery_type').eq('user_id', user.id).neq('status', 'archived'),
  ])

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <AdminLayout>
      <InventoryContent items={items || []} products={products || []} userId={user.id} totalCount={count || 0} currentPage={currentPage} totalPages={totalPages} />
    </AdminLayout>
  )
}
