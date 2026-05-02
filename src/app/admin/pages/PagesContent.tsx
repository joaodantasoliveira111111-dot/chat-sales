'use client'

import { useState } from 'react'
import { PublicPage } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, Badge, EmptyState } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { slugify, copyToClipboard } from '@/lib/utils'
import { Plus, Globe, Edit, Trash2, ExternalLink, Eye, Copy, Palette } from 'lucide-react'
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
        setPages(pages.map(p => p.id === editPage.id ? { ...p, ...data, product: product ? { name: product.name } : undefined, flow: flow ? { name: flow.name } : undefined } as any : p))
        toast.success('Página atualizada!')
      } else {
        const { data: newPage, error } = await supabase.from('public_pages').insert({
          id: uuidv4(), user_id: userId, ...data, background_config: {}, bubble_style: 'rounded', button_style: 'filled',
        }).select().single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        const flow = flows.find(f => f.id === data.flow_id)
        setPages([{ ...newPage, product: product ? { name: product.name } : undefined, flow: flow ? { name: flow.name } : undefined } as any, ...pages])
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
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Páginas Públicas</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{pages.length} página(s) criada(s)</p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={15} /> Nova Página
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Globe size={24} />}
            title="Nenhuma página criada"
            description="Crie uma página pública com um design otimizado para vender seu produto ou capturar leads."
            action={<Button onClick={openCreate} size="sm"><Plus size={14} />Criar primeira página</Button>}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {pages.map(page => (
            <Card key={page.id} hover>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: 'rgba(6,182,212,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Globe size={20} style={{ color: '#06B6D4' }} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{page.public_title}</span>
                    <Badge status={page.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>/p/{page.slug}</span>
                    {page.product && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📦 {page.product.name}</span>}
                    {page.flow && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⚡ {page.flow.name}</span>}
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>🎨 {page.theme_id}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {page.status === 'published' && (
                    <a href={getPageUrl(page.slug)} target="_blank" rel="noopener noreferrer" title="Ver Página" style={{
                      padding: '0.5rem', borderRadius: '8px', color: 'var(--text-subtle)', display: 'flex',
                      transition: 'all 0.15s', textDecoration: 'none',
                    }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}>
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <button onClick={() => openEdit(page)} title="Editar" style={{
                    padding: '0.5rem', borderRadius: '8px', background: 'transparent',
                    border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s',
                  }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}>
                    <Edit size={15} />
                  </button>
                  <button onClick={() => setDeletePage(page)} title="Excluir" style={{
                    padding: '0.5rem', borderRadius: '8px', background: 'transparent',
                    border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', display: 'flex', transition: 'all 0.15s',
                  }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editPage ? 'Editar Página' : 'Nova Página Pública'} size="lg" footer={
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => setShowForm(false)} fullWidth>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} fullWidth>{editPage ? 'Salvar alterações' : 'Criar página'}</Button>
        </div>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Título público" value={form.public_title} onChange={e => setForm(f => ({ ...f, public_title: e.target.value, slug: editPage ? f.slug : slugify(e.target.value) }))} placeholder="Ex: Oferta Especial" required />
          <Input label="Slug (URL)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} placeholder="oferta-especial" hint="URL final: chatfy.com/p/oferta-especial" required />
          <Textarea label="Subtítulo" value={form.public_subtitle} onChange={e => setForm(f => ({ ...f, public_subtitle: e.target.value }))} placeholder="Tagline da oferta" rows={2} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select label="Produto" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}>
              <option value="">Nenhum produto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select label="Fluxo conversacional" value={form.flow_id} onChange={e => setForm(f => ({ ...f, flow_id: e.target.value }))}>
              <option value="">Nenhum fluxo</option>
              {flows.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
          </div>

          <Card elevated>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Palette size={16} style={{ color: 'var(--primary-light)' }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Design e Template</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Select label="Template visual" value={form.theme_id} onChange={e => setForm(f => ({ ...f, theme_id: e.target.value }))}>
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                {!themes.some(t => t.id === 'whatsapp') && <option value="whatsapp">WhatsApp Classic (Pendente Sincronização)</option>}
                {!themes.some(t => t.id === 'instagram') && <option value="instagram">Instagram DM (Pendente Sincronização)</option>}
                {!themes.some(t => t.id === 'dark_premium') && <option value="dark_premium">Dark Premium (Pendente Sincronização)</option>}
              </Select>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Cor primária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent' }} />
                    <input value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} className="neu-input" style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Cor secundária</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="color" value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} style={{ width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent' }} />
                    <input value={form.secondary_color} onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))} className="neu-input" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePage}
        onClose={() => setDeletePage(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir página"
        description={`Tem certeza que deseja excluir "${deletePage?.public_title}"? Esta ação não pode ser desfeita e o link deixará de funcionar.`}
        confirmLabel="Excluir página"
        variant="danger"
      />
    </div>
  )
}
