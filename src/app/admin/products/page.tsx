import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductsContent } from './ProductsContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PAGE_SIZE = 20

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: products, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[products page] erro ao carregar produtos', error)
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <AdminLayout>
      <ProductsContent products={products || []} userId={user.id} totalCount={count || 0} currentPage={currentPage} totalPages={totalPages} />
    </AdminLayout>
  )
}
