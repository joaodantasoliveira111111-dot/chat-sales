'use client'

import { useState } from 'react'
import { PublicPage } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { GlassCard, Badge } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { slugify, copyToClipboard } from '@/lib/utils'
import { Plus, Globe, Edit, Trash2, ExternalLink, Eye, Copy } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Link from 'next/link'

const emptyForm = {
  product_id: '',
  flow_id: '',
  slug: '',
  public_title: '',
  public_subtitle: '',
  theme_id: 'dark_premium',
  primary_color: '#8B5CF6',
  secondary_color: '#06B6D4',
  show_header: true,
  show_support_button: false,
  show_microcopy: false,
  microcopy_text: '',
  show_powered_by: false,
  status: 'draft' as 'draft' | 'published' | 'archived',
}

export function PagesContent({
  pages: initialPages,
  products,
  flows,
  themes,
  userId,
  appUrl,
}: {
  pages: (PublicPage & { product?: { name: string } | null; flow?: { name: string } | null })[]
  products: { id: string; name: string }[]
  flows: { id: string; name: string }[]
  themes: { id: string; name: string; description: string | null }[]
  userId: string
  appUrl: string
}) {
  const toast = useToast()
  const [pages, setPages] = useState(initialPages)
  const [showForm, setShowForm] = useState(false)
  const [editPage, setEditPage] = useState<typeof initialPages[0] | null>(null)
  const [deletePage, setDeletePage] = useState<typeof initialPages[0] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setEditPage(null)
    setForm(emptyForm)
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
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.public_title || !form.slug) return toast.error('Título e slug são obrigatórios')
    setSaving(true)
    try {
      const supabase = createClient()
      const data = {
        product_id: form.product_id || null,
        flow_id: form.flow_id || null,
        slug: form.slug,
        public_title: form.public_title,
        public_subtitle: form.public_subtitle || null,
        theme_id: form.theme_id,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        show_header: form.show_header,
        show_support_button: form.show_support_button,
        show_microcopy: form.show_microcopy,
        microcopy_text: form.microcopy_text || null,
        show_powered_by: form.show_powered_by,
        status: form.status,
      }

      if (editPage) {
        const { error } = await supabase.from('public_pages').update(data).eq('id', editPage.id)
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        const flow = flows.find(f => f.id === data.flow_id)
        setPages(pages.map(p => p.id === editPage.id ? { ...p, ...data, product: product ? { name: product.name } : null, flow: flow ? { name: flow.name } : null } : p))
        toast.success('Página atualizada!')
      } else {
        const { data: newPage, error } = await supabase.from('public_pages').insert({
          id: uuidv4(), user_id: userId, ...data, background_config: {}, bubble_style: 'rounded', button_style: 'filled',
        }).select().single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        const flow = flows.find(f => f.id === data.flow_id)
        setPages([{ ...newPage, product: product ? { name: product.name } : null, flow: flow ? { name: flow.name } : null }, ...pages])
        toast.success('Página criada!')
      }
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message?.includes('slug') ? 'Esse slug já está em uso' : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePage) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('public_pages').delete().eq('id', deletePage.id)
      setPages(pages.filter(p => p.id !== deletePage.id))
      toast.success('Página removida')
      setDeletePage(null)
    } catch {
      toast.error('Erro ao remover')
    } finally {
      setDeleting(false)
    }
  }

  const getPageUrl = (slug: string) => `${appUrl}/p/${slug}`

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Páginas Públicas</h1>
          <p className="text-slate-400 text-sm mt-1">{pages.length} página(s) criada(s)</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} />Nova Página</Button>
      </div>

      {pages.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Globe size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-2">Nenhuma página criada</p>
          <p className="text-slate-500 text-sm mb-6">Crie uma página pública para cada produto que deseja vender.</p>
          <Button onClick={openCreate}><Plus size={16} />Criar primeira página</Button>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {pages.map(page => (
            <GlassCard key={page.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <Globe size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{page.public_title}</p>
                  <Badge status={page.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>/p/{page.slug}</span>
                  {page.product && <span>{page.product.name}</span>}
                  {page.flow && <span>Fluxo: {page.flow.name}</span>}
                  <span>{page.theme_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {page.status === 'published' && (
                  <a href={getPageUrl(page.slug)} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      <Eye size={14} />
                      Ver
                    </Button>
                  </a>
                )}
                <button onClick={() => openEdit(page)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                  <Edit size={15} />
                </button>
                <button onClick={() => setDeletePage(page)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editPage ? 'Editar Página' : 'Nova Página Pública'} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Título público"
              value={form.public_title}
              onChange={e => setForm(f => ({ ...f, public_title: e.target.value, slug: editPage ? f.slug : slugify(e.target.value) }))}
              placeholder="Ex: Oferta Especial"
              required
            />
            <Input
              label="Slug (URL)"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
              placeholder="oferta-especial"
              hint="/p/oferta-especial"
              required
            />
          </div>
          <Input label="Subtítulo" value={form.public_subtitle} onChange={e => setForm(f => ({ ...f, public_subtitle: e.target.value }))} placeholder="Tagline da oferta" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Produto" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">Selecionar produto...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select label="Fluxo conversacional" value={form.flow_id} onChange={e => setForm(f => ({ ...f, flow_id: e.target.value }))}>
              <option value="">Sem fluxo</option>
              {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </div>
          <Select label="Template visual" value={form.theme_id} onChange={e => setForm(f => ({ ...f, theme_id: e.target.value }))}>
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Cor primária</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" />
                <input value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Cor secundária</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10" />
                <input value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'show_header', label: 'Mostrar cabeçalho' },
              { key: 'show_microcopy', label: 'Mostrar microcopy' },
              { key: 'show_powered_by', label: 'Mostrar "Powered by Chatfy"' },
              { key: 'show_support_button', label: 'Botão de suporte' },
            ].map(toggle => (
              <label key={toggle.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[toggle.key as keyof typeof form] as boolean}
                  onChange={e => setForm(f => ({ ...f, [toggle.key]: e.target.checked }))}
                  className="w-4 h-4 accent-violet-500 rounded"
                />
                {toggle.label}
              </label>
            ))}
          </div>
          {form.show_microcopy && (
            <Input label="Texto do microcopy" value={form.microcopy_text} onChange={e => setForm(f => ({ ...f, microcopy_text: e.target.value }))} placeholder="Ex: Entrega imediata após pagamento" />
          )}
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editPage ? 'Salvar' : 'Criar página'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deletePage} onClose={() => setDeletePage(null)} onConfirm={handleDelete} loading={deleting}
        title="Excluir página" description={`Excluir "${deletePage?.public_title}"?`} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
