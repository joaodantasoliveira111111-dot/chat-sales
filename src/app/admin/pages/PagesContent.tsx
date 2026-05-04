'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PublicPage } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { slugify, copyToClipboard } from '@/lib/utils'
import { Plus, Globe, Edit, Trash2, ExternalLink, Copy, Palette, CheckCircle } from 'lucide-react'

const emptyForm = {
  product_id: '',
  flow_id: '',
  slug: '',
  public_title: '',
  public_subtitle: '',
  avatar_url: '',
  theme_id: 'dark_premium',
  primary_color: '#0B7CFF',
  secondary_color: '#00C2FF',
  show_header: true,
  show_support_button: false,
  show_microcopy: false,
  microcopy_text: '',
  show_powered_by: false,
  status: 'draft' as 'draft' | 'published' | 'archived',
}

type PageWithRelations = PublicPage & {
  product?: { name: string } | null
  flow?: { name: string } | null
}

const statusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
}

export function PagesContent({
  pages: initialPages,
  products,
  flows,
  themes,
  userId,
  appUrl,
}: {
  pages: PageWithRelations[]
  products: { id: string; name: string }[]
  flows: { id: string; name: string }[]
  themes: { id: string; name: string; description: string | null }[]
  userId: string
  appUrl: string
}) {
  const router = useRouter()
  const [pages, setPages] = useState(initialPages)
  const [showForm, setShowForm] = useState(false)
  const [editPage, setEditPage] = useState<typeof initialPages[0] | null>(null)
  const [deletePage, setDeletePage] = useState<typeof initialPages[0] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const openCreate = () => {
    setEditPage(null)
    setForm(emptyForm)
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (page: typeof initialPages[0]) => {
    setEditPage(page)
    setForm({
      product_id: page.product_id || '',
      flow_id: page.flow_id || '',
      slug: page.slug,
      public_title: page.public_title,
      public_subtitle: page.public_subtitle || '',
      avatar_url: page.avatar_url || '',
      theme_id: page.theme_id,
      primary_color: page.primary_color,
      secondary_color: page.secondary_color,
      show_header: page.show_header,
      show_support_button: page.show_support_button,
      show_microcopy: page.show_microcopy,
      microcopy_text: page.microcopy_text || '',
      show_powered_by: page.show_powered_by,
      status: page.status,
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    setFormError(null)
    if (!form.public_title.trim() || !form.slug.trim()) {
      const message = 'Título e slug são obrigatórios'
      setFormError(message)
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const data = {
        product_id: form.product_id || null,
        flow_id: form.flow_id || null,
        slug: form.slug,
        public_title: form.public_title,
        public_subtitle: form.public_subtitle || null,
        avatar_url: form.avatar_url || null,
        theme_id: form.theme_id,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        show_header: form.show_header,
        show_support_button: editPage?.show_support_button || false,
        show_microcopy: form.show_microcopy,
        microcopy_text: form.microcopy_text || null,
        show_powered_by: form.show_powered_by,
        status: form.status,
      }

      if (editPage) {
        const { data: updatedPage, error } = await supabase
          .from('public_pages')
          .update(data)
          .eq('id', editPage.id)
          .eq('user_id', userId)
          .select('*')
          .single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        const flow = flows.find(f => f.id === data.flow_id)
        const updatedWithRelations = {
          ...updatedPage,
          product: product ? { name: product.name } : null,
          flow: flow ? { name: flow.name } : null,
        } as PageWithRelations
        setPages(prev => prev.map(p => p.id === editPage.id ? updatedWithRelations : p))
      } else {
        const { data: newPage, error } = await supabase
          .from('public_pages')
          .insert({
            user_id: userId,
            ...data,
            background_config: {},
            bubble_style: 'rounded',
            button_style: 'filled',
          })
          .select('*')
          .single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        const flow = flows.find(f => f.id === data.flow_id)
        const newWithRelations = {
          ...newPage,
          product: product ? { name: product.name } : null,
          flow: flow ? { name: flow.name } : null,
        } as PageWithRelations
        setPages(prev => [newWithRelations, ...prev])
      }
      setShowForm(false)
      router.refresh()
    } catch (err: unknown) {
      console.error('[pages] erro ao salvar página pública', err)
      const message = err instanceof Error ? err.message : ''
      const friendlyMessage = message.includes('slug')
        ? 'Esse slug já está em uso'
        : `Erro ao salvar${message ? `: ${message}` : ''}`
      setFormError(friendlyMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePage) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('public_pages')
        .delete()
        .eq('id', deletePage.id)
        .eq('user_id', userId)
      if (error) throw error
      setPages(prev => prev.filter(p => p.id !== deletePage.id))
      setDeletePage(null)
    } catch {
      // Handle error silently
    } finally {
      setDeleting(false)
    }
  }

  const getPageUrl = (slug: string) => `${appUrl.replace(/\/+$/, '')}/p/${slug}`

  const handleCopyUrl = async (slug: string) => {
    await copyToClipboard(getPageUrl(slug))
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const productOptions = [
    { value: '', label: 'Nenhum produto' },
    ...products.map(p => ({ value: p.id, label: p.name })),
  ]

  const flowOptions = [
    { value: '', label: 'Nenhum fluxo' },
    ...flows.map(f => ({ value: f.id, label: f.name })),
  ]

  const themeOptions = themes.map(t => ({ value: t.id, label: t.name }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081827]">
            Páginas Públicas
          </h1>
          <p className="text-sm text-[#35516B] mt-1">
            {pages.length} página{pages.length !== 1 ? 's' : ''} criada{pages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} size="md" leftIcon={<Plus size={18} />}>
          Nova Página
        </Button>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Globe className="w-12 h-12 text-[#71869B]" />}
              title="Nenhuma página criada"
              description="Crie uma página pública com um design otimizado para vender seu produto ou capturar leads."
              action={
                <Button onClick={openCreate}>Criar primeira página</Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map(page => (
            <Card key={page.id} hoverable>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
          <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[rgba(11,124,255,0.08)] flex items-center justify-center">
            <Globe size={24} className="text-[#0B7CFF]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#081827]">{page.public_title}</h3>
                      <Badge variant={statusVariantMap[page.status] || 'default'} size="sm">
                        {page.status === 'published' ? 'Publicado' : 
                         page.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                      <span className="text-[#71869B] font-mono">/p/{page.slug}</span>
                      {page.product && (
                        <span className="text-[#35516B]">
                          <span className="text-[#71869B]">Produto:</span> {page.product.name}
                        </span>
                      )}
                      {page.flow && (
                        <span className="text-[#35516B]">
                          <span className="text-[#71869B]">Fluxo:</span> {page.flow.name}
                        </span>
                      )}
                      <span className="text-[#35516B]">
                        <span className="text-[#71869B]">Tema:</span> {page.theme_id}
                      </span>
                    </div>

                    {/* URL Display */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F3F7FB] rounded-xl">
          <span className="text-xs text-[#35516B] font-mono">
            {getPageUrl(page.slug)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {page.status === 'published' && (
          <a
            href={getPageUrl(page.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
            title="Ver pagina"
          >
            <ExternalLink size={18} />
          </a>
        )}

        <button
          onClick={() => handleCopyUrl(page.slug)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
          title="Copiar link"
        >
          {copiedSlug === page.slug ? (
            <CheckCircle size={18} className="text-[#16A34A]" />
          ) : (
            <Copy size={18} />
          )}
        </button>

        <button
          onClick={() => openEdit(page)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
          title="Editar"
        >
          <Edit size={18} />
        </button>

        <button
          onClick={() => setDeletePage(page)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
          title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editPage ? 'Editar Página' : 'Nova Página Pública'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editPage ? 'Salvar alterações' : 'Criar página'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.15)] rounded-xl text-sm text-[#DC2626]">
              {formError}
            </div>
          )}
          
          <Input
            label="Título público"
            value={form.public_title}
            onChange={e => setForm(f => ({ ...f, public_title: e.target.value, slug: editPage ? f.slug : slugify(e.target.value) }))}
            placeholder="Ex: Oferta Especial"
            required
            fullWidth
          />

          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="oferta-especial"
            helperText="URL final: chatfy.com/p/oferta-especial"
            required
            fullWidth
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A6178]">
              Subtítulo
            </label>
            <textarea
              value={form.public_subtitle}
              onChange={e => setForm(f => ({ ...f, public_subtitle: e.target.value }))}
              placeholder="Tagline da oferta"
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
            />
          </div>

          <Input
            label="Imagem do perfil"
            value={form.avatar_url}
            onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
            placeholder="https://exemplo.com/avatar.jpg"
            helperText="Aparece como avatar circular no topo e nas mensagens do bot."
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Produto"
              value={form.product_id}
              onChange={value => setForm(f => ({ ...f, product_id: value }))}
              options={productOptions}
              fullWidth
            />
            
            <Select
              label="Fluxo conversacional"
              value={form.flow_id}
              onChange={value => setForm(f => ({ ...f, flow_id: value }))}
              options={flowOptions}
              fullWidth
            />
          </div>

          {/* Design Section */}
          <Card variant="outlined">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-primary-600" />
                <h3 className="font-semibold text-[#081827]">Design e Template</h3>
              </div>
              
              <div className="space-y-4">
        <Select
          label="Template visual"
          value={form.theme_id}
          onChange={value => setForm(f => ({ ...f, theme_id: value }))}
          options={themeOptions}
          fullWidth
        />
      </div>
            </CardContent>
          </Card>

          <Select
            label="Status"
            value={form.status}
            onChange={value => setForm(f => ({ ...f, status: value as any }))}
            options={statusOptions}
            fullWidth
          />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deletePage}
        onClose={() => setDeletePage(null)}
        title="Excluir página"
        description={`Tem certeza que deseja excluir "${deletePage?.public_title}"? Esta ação não pode ser desfeita e o link deixará de funcionar.`}
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletePage(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Excluir página
            </Button>
          </div>
        }
      />
    </div>
  )
}