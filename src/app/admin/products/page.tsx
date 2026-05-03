import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ProductsContent } from './ProductsContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[products page] erro ao carregar produtos', error)
  }

  return (
    <AdminLayout>
      <ProductsContent products={products || []} userId={user.id} />
    </AdminLayout>
  )
}
