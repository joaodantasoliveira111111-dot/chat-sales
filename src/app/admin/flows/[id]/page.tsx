import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { FlowBuilderClient } from './FlowBuilderClient'

export default async function FlowBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [
    { data: flow },
    { data: nodes },
    { data: edges },
    { data: products },
  ] = await Promise.all([
    supabase.from('flows').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('flow_nodes').select('*').eq('flow_id', id).order('created_at'),
    supabase.from('flow_edges').select('*').eq('flow_id', id),
    supabase.from('products').select('id, name, price').eq('user_id', user.id).eq('status', 'active'),
  ])

  if (!flow) redirect('/admin/flows')

  return (
    <AdminLayout>
      <FlowBuilderClient
        flow={flow}
        initialNodes={nodes || []}
        initialEdges={edges || []}
        products={products || []}
        userId={user.id}
      />
    </AdminLayout>
  )
}
