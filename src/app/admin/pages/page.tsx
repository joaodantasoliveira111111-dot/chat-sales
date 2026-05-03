import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { PagesContent } from './PagesContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeAppUrl(value: string) {
  return value.replace(/\/+$/, '')
}

async function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL)
  }

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  if (!host) return 'http://localhost:3000'

  const proto = headersList.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export default async function PagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const [
    { data: pages, error: pagesError },
    { data: products, error: productsError },
    { data: flows, error: flowsError },
    { data: themes, error: themesError },
  ] = await Promise.all([
    supabase.from('public_pages').select('*, product:products(name), flow:flows!public_pages_flow_id_fkey(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('products').select('id, name').eq('user_id', user.id).neq('status', 'archived'),
    supabase.from('flows').select('id, name').eq('user_id', user.id),
    supabase.from('themes').select('id, name, description').order('name'),
  ])

  if (pagesError) console.error('[pages page] erro ao carregar páginas', pagesError)
  if (productsError) console.error('[pages page] erro ao carregar produtos', productsError)
  if (flowsError) console.error('[pages page] erro ao carregar fluxos', flowsError)
  if (themesError) console.error('[pages page] erro ao carregar temas', themesError)

  return (
    <AdminLayout>
      <PagesContent
        pages={pages || []}
        products={products || []}
        flows={flows || []}
        themes={themes || []}
        userId={user.id}
        appUrl={await getAppUrl()}
      />
    </AdminLayout>
  )
}
