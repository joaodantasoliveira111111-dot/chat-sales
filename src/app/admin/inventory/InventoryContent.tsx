'use client'

import { useState, useRef } from 'react'
import { InventoryItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/utils'
import { Plus, Archive, Edit, Trash2, Search, Upload, Download, Mail, Key, Link as LinkIcon, FileText } from 'lucide-react'
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

const statusVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  available: 'success',
  reserved: 'warning',
  delivered: 'success',
  disabled: 'error',
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
}: {
  items: (InventoryItem & { product?: { name: string } | null })[]
  products: { id: string; name: string; delivery_type: string | null }[]
  userId: string
}) {
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
    } catch {
      // Handle error silently
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
      setDeleteItem(null)
    } catch {
      // Handle error silently
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
        return <Mail size={20} className="text-blue-600" />
      case 'license_key':
        return <Key size={20} className="text-purple-600" />
      case 'link':
        return <LinkIcon size={20} className="text-cyan-600" />
      case 'file':
        return <FileText size={20} className="text-orange-600" />
      default:
        return <Archive size={20} className="text-slate-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Estoque
          </h1>
          <p className="text-sm text-slate-600 mt-1">
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
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-10 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
          className="h-10 px-4 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {productFilterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Items List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Archive}
              title={items.length === 0 ? 'Estoque vazio' : 'Nenhum item encontrado'}
              description={items.length === 0 ? 'Adicione credenciais, links, arquivos ou outros entregáveis digitais.' : 'Nenhum item corresponde à sua busca.'}
              action={items.length === 0 ? {
                label: 'Adicionar primeiro item',
                onClick: openCreate,
              } : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id} hoverable>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    {getDeliveryIcon(item.delivery_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.title || deliveryTypeLabelMap[item.delivery_type]}
                      </h3>
                      <Badge variant={statusVariantMap[item.status] || 'default'} size="sm">
                        {statusLabelMap[item.status] || item.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {item.product?.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
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
                      <span className="text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'available' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <Button onClick={handleSave} loading={saving}>
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
            <label className="block text-sm font-medium text-slate-700">
              Conteúdo personalizado
            </label>
            <textarea
              value={form.custom_content}
              onChange={e => setForm(f => ({ ...f, custom_content: e.target.value }))}
              placeholder="Conteúdo a entregar..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Instruções extras
            </label>
            <textarea
              value={form.extra_instructions}
              onChange={e => setForm(f => ({ ...f, extra_instructions: e.target.value }))}
              placeholder="Como usar o produto..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
              loading={deleting}
            >
              Remover
            </Button>
          </div>
        }
      />
    </div>
  )
}