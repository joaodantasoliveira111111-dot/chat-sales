'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InventoryItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { formatDate } from '@/lib/utils'
import { Plus, Archive, Edit, Trash2, Search, Upload, Download, Mail, Key, Link as LinkIcon, FileText, CheckSquare, Square, Trash } from 'lucide-react'
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

const deliveryTypeOptions = [
  { value: 'digital_credential', label: 'Credencial Digital' },
  { value: 'file', label: 'Arquivo' },
  { value: 'link', label: 'Link' },
  { value: 'license_key', label: 'Chave de Licença' },
  { value: 'custom_text', label: 'Texto Personalizado' },
]

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'available', label: 'Disponível' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'disabled', label: 'Desativado' },
]

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  available: 'success',
  reserved: 'warning',
  delivered: 'success',
  disabled: 'danger',
}

const statusLabelMap: Record<string, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  delivered: 'Entregue',
  disabled: 'Desativado',
}

const deliveryTypeLabelMap: Record<string, string> = {
  digital_credential: 'Credencial Digital',
  file: 'Arquivo',
  link: 'Link',
  license_key: 'Chave de Licença',
  custom_text: 'Texto Personalizado',
}

export function InventoryContent({
  items: initialItems,
  products,
  userId,
  totalCount,
  currentPage,
  totalPages,
}: {
  items: (InventoryItem & { product?: { name: string } | null })[]
  products: { id: string; name: string; delivery_type: string | null }[]
  userId: string
  totalCount: number
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const toast = useToast()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filtered = items.filter(i => {
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.access_email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    const matchProduct = productFilter === 'all' || i.product_id === productFilter
    return matchSearch && matchStatus && matchProduct
  })

  const productOptions = [
    { value: '', label: 'Selecionar produto...' },
    ...products.map(p => ({ value: p.id, label: p.name })),
  ]

  const productFilterOptions = [
    { value: 'all', label: 'Todos os produtos' },
    ...products.map(p => ({ value: p.id, label: p.name })),
  ]

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
    if (!form.product_id || !form.delivery_type) return
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
        setItems(items.map(i => i.id === editItem.id ? { ...i, ...data, product: product ? { name: product.name } : null } as any : i))
      } else {
        const { data: newItem, error } = await supabase.from('inventory_items').insert({
          id: uuidv4(), user_id: userId, status: 'available', ...data,
        }).select().single()
        if (error) throw error
        const product = products.find(p => p.id === data.product_id)
        setItems([{ ...newItem, product: product ? { name: product.name } : null }, ...items])
      }
      setShowForm(false)
      toast.success(editItem ? 'Item atualizado' : 'Item criado')
    } catch {
      toast.error('Erro ao salvar item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('inventory_items').update({ deleted_at: new Date().toISOString() }).eq('id', deleteItem.id)
      const deletedItem = deleteItem
      setItems(items.filter(i => i.id !== deletedItem.id))
      setDeleteItem(null)
      toast.warning('Item excluído', 6000, {
        label: 'Desfazer',
        onClick: async () => {
          const { error: undoError } = await supabase.from('inventory_items').update({ deleted_at: null }).eq('id', deletedItem.id)
          if (!undoError) {
            setItems(prev => [deletedItem, ...prev])
            toast.success('Exclusão desfeita')
          }
        },
      })
    } catch {
      toast.error('Erro ao excluir item')
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const available = filtered.filter(i => i.status === 'available')
    if (selectedIds.size === available.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(available.map(i => i.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      const supabase = createClient()
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('inventory_items').update({ deleted_at: new Date().toISOString() }).in('id', ids)
      if (error) throw error
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
      const count = selectedIds.size
      setSelectedIds(new Set())
      toast.success(`${count} item${count > 1 ? 's' : ''} excluído${count > 1 ? 's' : ''}`)
    } catch {
      toast.error('Erro ao excluir itens')
    } finally {
      setBulkDeleting(false)
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

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case 'digital_credential':
        return <Mail size={20} className="text-[#0B7CFF]" />
      case 'license_key':
        return <Key size={20} className="text-[#6D5DF6]" />
      case 'link':
        return <LinkIcon size={20} className="text-[#00C2FF]" />
      case 'file':
        return <FileText size={20} className="text-[#F97316]" />
      default:
        return <Archive size={20} className="text-[#35516B]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081827]">
            Estoque
          </h1>
          <p className="text-sm text-[#35516B] mt-1">
            {availableCount} disponível · {deliveredCount} entregue · {items.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportCSV} leftIcon={<Download size={16} />}>
            Exportar CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<Upload size={16} />}>
            Importar CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          <Button onClick={openCreate} size="sm" leftIcon={<Plus size={16} />}>
            Adicionar item
          </Button>
        </div>
      </div>

{/* Filters */}
<div className="flex flex-col sm:flex-row gap-3">
  <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
  <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
  <FilterSelect value={productFilter} onChange={setProductFilter} options={productFilterOptions} />
</div>

  {/* Bulk Actions Bar */}
  {selectedIds.size > 0 && (
    <div className="flex items-center gap-3 p-3 bg-[rgba(220,38,38,0.04)] border border-[rgba(220,38,38,0.12)] rounded-xl">
      <span className="text-sm font-medium text-[#081827]">{selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}</span>
      <Button variant="danger" size="sm" onClick={handleBulkDelete} isLoading={bulkDeleting} leftIcon={<Trash size={14} />}>
        Excluir selecionados
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setSelectedIds(new Set())}>
        Cancelar
      </Button>
    </div>
  )}

  {/* Items List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Archive className="w-12 h-12 text-[#71869B]" />}
              title={items.length === 0 ? 'Estoque vazio' : 'Nenhum item encontrado'}
              description={items.length === 0 ? 'Adicione credenciais, links, arquivos ou outros entregáveis digitais.' : 'Nenhum item corresponde à sua busca.'}
              action={items.length === 0 ? (
                <Button onClick={openCreate}>Adicionar primeiro item</Button>
              ) : undefined}
            />
          </CardContent>
        </Card>
) : (
  <div className="space-y-3">
  {/* Select All */}
  {filtered.filter(i => i.status === 'available').length > 0 && (
    <button
      onClick={toggleSelectAll}
      className="flex items-center gap-2 text-sm text-[#35516B] hover:text-[#081827] transition-colors px-1"
    >
      {selectedIds.size === filtered.filter(i => i.status === 'available').length ? (
        <CheckSquare size={16} className="text-[#0B7CFF]" />
      ) : (
        <Square size={16} className="text-[#71869B]" />
      )}
      Selecionar todos disponíveis
    </button>
  )}
  {filtered.map(item => (
  <Card key={item.id} hoverable>
  <CardContent className="p-4">
  <div className="flex items-center gap-4">
  {/* Checkbox (only for available items) */}
  {item.status === 'available' ? (
    <button
      onClick={() => toggleSelect(item.id)}
      className="flex-shrink-0"
      aria-label={`Selecionar ${item.title || 'item'}`}
    >
      {selectedIds.has(item.id) ? (
        <CheckSquare size={18} className="text-[#0B7CFF]" />
      ) : (
        <Square size={18} className="text-[#71869B] hover:text-[#35516B]" />
      )}
    </button>
  ) : (
    <div className="w-[18px] flex-shrink-0" />
  )}

  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[#F3F7FB] flex items-center justify-center">
                    {getDeliveryIcon(item.delivery_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#081827]">
                        {item.title || deliveryTypeLabelMap[item.delivery_type]}
                      </h3>
                      <Badge variant={statusVariantMap[item.status] || 'default'} size="sm">
                        {statusLabelMap[item.status] || item.status}
                      </Badge>
                      <span className="text-xs text-[#71869B]">
                        {item.product?.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#35516B]">
                      {item.access_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {item.access_email}
                        </span>
                      )}
                      {item.license_key && (
                        <span className="flex items-center gap-1">
                          <Key size={14} />
                          {item.license_key.slice(0, 15)}...
                        </span>
                      )}
                      {item.access_url && (
                        <span className="flex items-center gap-1">
                          <LinkIcon size={14} />
                          Link
                        </span>
                      )}
                      <span className="text-[#71869B]">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'available' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
          title="Editar"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => setDeleteItem(item)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
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
        title={editItem ? 'Editar item' : 'Novo item de estoque'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editItem ? 'Salvar alterações' : 'Adicionar ao estoque'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Produto"
            value={form.product_id}
            onChange={value => setForm(f => ({ ...f, product_id: value }))}
            options={productOptions}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Título (opcional)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Conta Premium"
              fullWidth
            />
            
            <Select
              label="Tipo de entrega"
              value={form.delivery_type}
              onChange={value => setForm(f => ({ ...f, delivery_type: value }))}
              options={deliveryTypeOptions}
              fullWidth
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail de acesso"
              type="email"
              value={form.access_email}
              onChange={e => setForm(f => ({ ...f, access_email: e.target.value }))}
              placeholder="conta@exemplo.com"
              leftIcon={<Mail size={18} />}
              fullWidth
            />
            
            <Input
              label="Senha de acesso"
              type="password"
              value={form.access_password}
              onChange={e => setForm(f => ({ ...f, access_password: e.target.value }))}
              placeholder="•••••••"
              fullWidth
            />
          </div>

          <Input
            label="URL de acesso"
            value={form.access_url}
            onChange={e => setForm(f => ({ ...f, access_url: e.target.value }))}
            placeholder="https://..."
            leftIcon={<LinkIcon size={18} />}
            fullWidth
          />

          <Input
            label="Chave de licença"
            value={form.license_key}
            onChange={e => setForm(f => ({ ...f, license_key: e.target.value }))}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            leftIcon={<Key size={18} />}
            fullWidth
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A6178]">
              Conteúdo personalizado
            </label>
            <textarea
              value={form.custom_content}
              onChange={e => setForm(f => ({ ...f, custom_content: e.target.value }))}
              placeholder="Conteúdo a entregar..."
              rows={3}
          className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#4A6178]">
          Instrucoes extras
        </label>
        <textarea
          value={form.extra_instructions}
          onChange={e => setForm(f => ({ ...f, extra_instructions: e.target.value }))}
          placeholder="Como usar o produto..."
          rows={2}
          className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Remover item"
        description="Tem certeza que deseja remover este item do estoque?"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteItem(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Remover
            </Button>
          </div>
        }
      />
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={(p) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(p))
        router.push(`?${params.toString()}`)
      }} />
    </div>
  )
}