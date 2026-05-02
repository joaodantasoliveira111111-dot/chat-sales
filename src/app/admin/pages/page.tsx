import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PagesContent } from './PagesContent'

export default async function PagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [{ data: pages }, { data: products }, { data: flows }, { data: themes }] = await Promise.all([
    supabase.from('public_pages').select('*, product:products(name), flow:flows(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('products').select('id, name').eq('user_id', user.id).neq('status', 'archived'),
    supabase.from('flows').select('id, name').eq('user_id', user.id),
    supabase.from('themes').select('id, name, description').order('name'),
  ])

  return (
    <AdminLayout>
      <PagesContent
        pages={pages || []}
        products={products || []}
        flows={flows || []}
        themes={themes || []}
        userId={user.id}
        appUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
      />
    </AdminLayout>
  )
}
