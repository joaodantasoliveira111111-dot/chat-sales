import { createAdminClient } from '@/lib/supabase/middleware'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PublicChatPage } from '@/components/chat/PublicChatPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  
  const { data: page } = await supabase
    .from('public_pages')
    .select('public_title, public_subtitle')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

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
  const supabase = createAdminClient()

  const { data: page } = await supabase
    .from('public_pages')
    .select(`
      *,
      product:products(*),
      flow:flows(*),
      theme:themes(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!page) notFound()

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

  return (
    <PublicChatPage
      page={page}
      nodes={nodes}
      edges={edges}
    />
  )
}
