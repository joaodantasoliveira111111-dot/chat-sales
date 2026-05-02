'use client'

import { useState, useRef } from 'react'
import { InventoryItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { GlassCard, Badge } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { getStatusLabel, formatDate } from '@/lib/utils'
import { Plus, Archive, Edit, Trash2, Search, Upload, Download } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import Papa from 'papaparse'

const emptyForm = {
  product_id: '',
  title: '',
  delivery_type: 'digital_credential',
  access_email: '',
  access_password: '',
  access_url: '',
  license_key: '',
  custom_content: '',
  extra_instructions: '',
}

export function InventoryContent({
  items: initialItems,
  products,
  userId,
}: {
  items: (InventoryItem & { product?: { name: string } | null })[]
  products: { id: string; name: string; delivery_type: string | null }[]
  userId: string
}) {
  const toast = useToast()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<typeof initialItems[0] | null>(null)
  const [deleteItem, setDeleteItem] = useState<typeof initialItems[0] | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.access_email?.includes(search)
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    const matchProduct = productFilter === 'all' || i.product_id === productFilter
    return matchSearch && matchStatus && matchProduct
  })

  const openCreate = () => {
    setEditItem(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (item: typeof initialItems[0]) => {
    setEditItem(item)
    setForm({
      product_id: item.product_id,
      title: item.title || '',
      delivery_type: item.delivery_type,
      access_email: item.access_email || '',
      access_password: item.access_password || '',
      access_url: item.access_url || '',
      license_key: item.license_key || '',
      custom_content: item.custom_content || '',
      extra_instructions: item.extra_instructions || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.product_id || !form.delivery_type) return toast.error('Produto e tipo de entrega são obrigatórios')
    setSaving(true)
    try {
      const supabase = createClient()
      const data = {
        product_id: form.product_id,
        title: form.title || null,
        delivery_type: form.delivery_type,
        access_email: form.access_email || null,
        access_password: form.access_password || null,
        access_url: form.access_url || null,
        license_key: form.license_key || null,
        custom_content: form.custom_content || null,
        extra_instructions: form.extra_instructions || null,
      }

      if (editItem) {
        const { error } = await supabase.from('inventory_items').update(data).eq('id', editItem.id)
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        setItems(items.map(i => i.id === editItem.id ? { ...i, ...data, product: product ? { name: product.name } : null } : i))
        toast.success('Item atualizado!')
      } else {
        const { data: newItem, error } = await supabase.from('inventory_items').insert({
          id: uuidv4(), user_id: userId, status: 'available', ...data,
        }).select().single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        setItems([{ ...newItem, product: product ? { name: product.name } : null }, ...items])
        toast.success('Item adicionado!')
      }
      setShowForm(false)
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('inventory_items').delete().eq('id', deleteItem.id)
      setItems(items.filter(i => i.id !== deleteItem.id))
      toast.success('Item removido')
      setDeleteItem(null)
    } catch {
      toast.error('Erro ao remover')
    } finally {
      setDeleting(false)
    }
  }

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]
        const supabase = createClient()
        let imported = 0

        for (const row of rows) {
          const product = products.find(p => p.name.toLowerCase() === row.product_slug?.toLowerCase() || p.id === row.product_slug)
          if (!product) continue

          await supabase.from('inventory_items').insert({
            id: uuidv4(),
            user_id: userId,
            product_id: product.id,
            title: row.title || null,
            delivery_type: row.delivery_type || 'custom_text',
            access_email: row.access_email || null,
            access_password: row.access_password || null,
            access_url: row.access_url || null,
            license_key: row.license_key || null,
            custom_content: row.custom_content || null,
            extra_instructions: row.extra_instructions || null,
            status: 'available',
          })
          imported++
        }

        toast.success(`${imported} item(s) importado(s)!`)
        window.location.reload()
      },
    })
  }

  const exportCSV = () => {
    const data = filtered.map(i => ({
      product_slug: i.product?.name || i.product_id,
      title: i.title || '',
      delivery_type: i.delivery_type,
      access_email: i.access_email || '',
      access_password: i.access_password || '',
      access_url: i.access_url || '',
      license_key: i.license_key || '',
      custom_content: i.custom_content || '',
      extra_instructions: i.extra_instructions || '',
      status: i.status,
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chatfy_inventory.csv'
    a.click()
  }

  const availableCount = items.filter(i => i.status === 'available').length
  const deliveredCount = items.filter(i => i.status === 'delivered').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Estoque</h1>
          <p className="text-slate-400 text-sm mt-1">
            {availableCount} disponível · {deliveredCount} entregue · {items.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={14} />
            Exportar CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            Importar CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          <Button onClick={openCreate}>
            <Plus size={16} />
            Adicionar item
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none">
          <option value="all">Todos os status</option>
          <option value="available">Disponível</option>
          <option value="reserved">Reservado</option>
          <option value="delivered">Entregue</option>
          <option value="disabled">Desativado</option>
        </select>
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none">
          <option value="all">Todos os produtos</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Archive size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-2">
            {items.length === 0 ? 'Estoque vazio' : 'Nenhum item encontrado'}
          </p>
          {items.length === 0 && (
            <>
              <p className="text-slate-500 text-sm mb-6">
                Adicione credenciais, links, arquivos ou outros entregáveis digitais.
              </p>
              <Button onClick={openCreate}><Plus size={16} />Adicionar primeiro item</Button>
            </>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <GlassCard key={item.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{item.title || getStatusLabel(item.delivery_type)}</p>
                  <Badge status={item.status} />
                  <span className="text-xs text-slate-500">{item.product?.name}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                  {item.access_email && <span>📧 {item.access_email}</span>}
                  {item.license_key && <span>🔑 {item.license_key.slice(0, 15)}...</span>}
                  {item.access_url && <span>🔗 Link</span>}
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              {item.status === 'available' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => setDeleteItem(item)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editItem ? 'Editar item' : 'Novo item de estoque'} size="lg">
        <div className="space-y-4">
          <Select label="Produto" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} required>
            <option value="">Selecionar produto...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Título (opcional)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Conta Premium" />
            <Select label="Tipo de entrega" value={form.delivery_type} onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))}>
              <option value="digital_credential">Credencial Digital</option>
              <option value="file">Arquivo</option>
              <option value="link">Link</option>
              <option value="license_key">Chave de Licença</option>
              <option value="custom_text">Texto Personalizado</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail de acesso" type="email" value={form.access_email} onChange={e => setForm(f => ({ ...f, access_email: e.target.value }))} placeholder="conta@exemplo.com" />
            <Input label="Senha de acesso" type="password" value={form.access_password} onChange={e => setForm(f => ({ ...f, access_password: e.target.value }))} placeholder="•••••••" />
          </div>
          <Input label="URL de acesso" value={form.access_url} onChange={e => setForm(f => ({ ...f, access_url: e.target.value }))} placeholder="https://..." />
          <Input label="Chave de licença" value={form.license_key} onChange={e => setForm(f => ({ ...f, license_key: e.target.value }))} placeholder="XXXX-XXXX-XXXX-XXXX" />
          <Textarea label="Conteúdo personalizado" value={form.custom_content} onChange={e => setForm(f => ({ ...f, custom_content: e.target.value }))} placeholder="Conteúdo a entregar..." rows={3} />
          <Textarea label="Instruções extras" value={form.extra_instructions} onChange={e => setForm(f => ({ ...f, extra_instructions: e.target.value }))} placeholder="Como usar o produto..." rows={2} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editItem ? 'Salvar' : 'Adicionar ao estoque'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} loading={deleting}
        title="Remover item" description="Tem certeza que deseja remover este item do estoque?" confirmLabel="Remover" variant="danger" />
    </div>
  )
}
