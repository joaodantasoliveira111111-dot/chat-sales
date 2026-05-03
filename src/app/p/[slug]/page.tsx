import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicChatPage } from '@/components/chat/PublicChatPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: page } = await supabase
    .from('public_pages')
    .select('public_title, public_subtitle')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!page) {
    return { title: 'Página não encontrada' }
  }

  return {
    title: page.public_title,
    description: page.public_subtitle || undefined,
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from('public_pages')
    .select(`
      *,
      product:products(*),
      flow:flows!public_pages_flow_id_fkey(*),
      theme:themes(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !page) notFound()

  // Get flow nodes and edges if flow is published
  let nodes = []
  let edges = []

  if (page.flow?.id && page.flow?.status === 'published') {
    const [nodesRes, edgesRes] = await Promise.all([
      supabase.from('flow_nodes').select('*').eq('flow_id', page.flow.id).order('created_at'),
      supabase.from('flow_edges').select('*').eq('flow_id', page.flow.id),
    ])
    nodes = nodesRes.data || []
    edges = edgesRes.data || []
  }

  const { data: metaSettings } = await supabase
    .from('meta_tracking_settings')
    .select('is_enabled,pixel_id,browser_tracking_enabled,server_tracking_enabled,advanced_matching_enabled,deduplication_enabled')
    .eq('user_id', page.user_id)
    .maybeSingle()

  return (
    <PublicChatPage
      page={page}
      nodes={nodes}
      edges={edges}
      metaSettings={metaSettings}
    />
  )
}
