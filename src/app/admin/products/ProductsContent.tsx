'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Product } from '@/types'
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
import { formatCurrency, slugify } from '@/lib/utils'
import { Plus, Package, Edit, Trash2, Search, ExternalLink, DollarSign, Tag, X, CheckSquare, Square, Trash } from 'lucide-react'

interface ProductsContentProps {
  products: Product[]
  userId: string
  totalCount: number
  currentPage: number
  totalPages: number
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  image_url: '',
  delivery_type: '' as string,
  status: 'draft' as 'draft' | 'active' | 'inactive' | 'archived',
  support_text: '',
  default_instructions: '',
}

const statusOptions = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'archived', label: 'Arquivado' },
]

const deliveryTypeOptions = [
  { value: '', label: 'Selecionar tipo...' },
  { value: 'digital_credential', label: 'Credencial Digital (e-mail + senha)' },
  { value: 'file', label: 'Arquivo' },
  { value: 'link', label: 'Link de acesso' },
  { value: 'license_key', label: 'Chave de Licença' },
  { value: 'custom_text', label: 'Texto Personalizado' },
  { value: 'manual', label: 'Entrega Manual' },
]

const statusVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'danger',
  archived: 'default',
}

export function ProductsContent({ products: initialProducts, userId, totalCount, currentPage, totalPages }: ProductsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCreate = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditProduct(p)
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      image_url: p.image_url || '',
      delivery_type: p.delivery_type || '',
      status: p.status,
      support_text: p.support_text || '',
      default_instructions: p.default_instructions || '',
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editProduct ? f.slug : slugify(name) }))
  }

  const handleSave = async () => {
    setFormError(null)
    if (!form.name.trim()) {
      const message = 'Nome é obrigatório'
      setFormError(message)
      return
    }
    if (!form.slug.trim()) {
      const message = 'Slug é obrigatório'
      setFormError(message)
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const data = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price) || 0,
        image_url: form.image_url.trim() || null,
        delivery_type: form.delivery_type || null,
        status: form.status,
        support_text: form.support_text.trim() || null,
        default_instructions: form.default_instructions.trim() || null,
      }

    if (editProduct) {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', editProduct.id)
        .eq('user_id', userId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ ...data, user_id: userId, currency: 'BRL' })
      if (error) throw error
    }
    setShowForm(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    router.push(`/admin/products?${params.toString()}`)
    router.refresh()
    } catch (err: unknown) {
      console.error('[products] erro ao salvar produto', err)
      const message = err instanceof Error ? err.message : ''
      const friendlyMessage = message.includes('slug') ? 'Esse slug já está em uso' : `Erro ao salvar produto${message ? `: ${message}` : ''}`
      setFormError(friendlyMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', deleteProduct.id).eq('user_id', userId)
      if (error) throw error
      const deletedProduct = deleteProduct
      setProducts(prev => prev.filter(p => p.id !== deletedProduct.id))
      setDeleteProduct(null)
      toast.warning('Produto excluído', 6000, {
        label: 'Desfazer',
        onClick: async () => {
          const { error: undoError } = await supabase.from('products').update({ deleted_at: null }).eq('id', deletedProduct.id).eq('user_id', userId)
          if (!undoError) {
            setProducts(prev => [deletedProduct, ...prev])
            toast.success('Exclusão desfeita')
          }
        },
      })
    } catch {
      toast.error('Erro ao excluir produto')
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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      const supabase = createClient()
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).in('id', ids).eq('user_id', userId)
      if (error) throw error
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)))
      const count = selectedIds.size
      setSelectedIds(new Set())
      toast.success(`${count} produto${count > 1 ? 's' : ''} excluído${count > 1 ? 's' : ''}`)
    } catch {
      toast.error('Erro ao excluir produtos')
    } finally {
      setBulkDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081827]">
            Produtos
          </h1>
          <p className="text-sm text-[#35516B] mt-1">
            {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} size="md" leftIcon={<Plus size={18} />}>
          Novo Produto
        </Button>
      </div>

{/* Filters */}
<div className="flex flex-col sm:flex-row gap-3">
  <SearchInput value={search} onChange={setSearch} placeholder="Buscar produto..." />
  <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} placeholder="Todos os status" />
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

  {/* Products List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={<Package className="w-12 h-12 text-[#71869B]" />}
              title={products.length === 0 ? 'Nenhum produto ainda' : 'Nenhum resultado'}
              description={products.length === 0 ? 'Crie seu primeiro produto digital para começar a vender.' : 'Tente ajustar os filtros de busca.'}
              action={products.length === 0 ? (
                <Button onClick={openCreate}>Criar primeiro produto</Button>
              ) : undefined}
            />
          </CardContent>
        </Card>
      ) : (
  <div className="space-y-3">
  {/* Select All */}
  {filtered.length > 0 && (
    <button
      onClick={toggleSelectAll}
      className="flex items-center gap-2 text-sm text-[#35516B] hover:text-[#081827] transition-colors px-1"
    >
      {selectedIds.size === filtered.length ? (
        <CheckSquare size={16} className="text-[#0B7CFF]" />
      ) : (
        <Square size={16} className="text-[#71869B]" />
      )}
      Selecionar todos
    </button>
  )}
  {filtered.map(product => (
            <Card key={product.id} hoverable>
  <CardContent className="p-4">
  <div className="flex items-center gap-4">
  {/* Checkbox */}
  <button
    onClick={() => toggleSelect(product.id)}
    className="flex-shrink-0"
    aria-label={`Selecionar ${product.name}`}
  >
    {selectedIds.has(product.id) ? (
      <CheckSquare size={18} className="text-[#0B7CFF]" />
    ) : (
      <Square size={18} className="text-[#71869B] hover:text-[#35516B]" />
    )}
  </button>

  {/* Icon / Image */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#081827] truncate">{product.name}</h3>
                      <Badge variant={statusVariantMap[product.status] || 'default'} size="sm">
                        {product.status === 'active' ? 'Ativo' : 
                         product.status === 'draft' ? 'Rascunho' : 
                         product.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[#71869B] font-mono">/{product.slug}</span>
                      <span className="font-semibold text-[#0B7CFF]">
                        {formatCurrency(product.price)}
                      </span>
                      {product.delivery_type && (
                        <span className="text-[#71869B] text-xs">
                          {product.delivery_type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <a
                      href={`/p/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
          className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
          title="Ver pagina publica"
        >
          <ExternalLink size={18} />
        </a>
        <button
          onClick={() => openEdit(product)}
          className="p-2 rounded-xl text-[#71869B] hover:text-[#35516B] hover:bg-[#F3F7FB] transition-colors"
          title="Editar"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => setDeleteProduct(product)}
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
        title={editProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editProduct ? 'Salvar alterações' : 'Criar produto'}
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
            label="Nome do produto"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ex: Acesso Premium — Curso de Vendas"
            required
            fullWidth
          />

          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="acesso-premium-curso-de-vendas"
            helperText="Usado na URL pública: chatfy.com/p/seu-slug"
            required
            fullWidth
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A6178]">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva brevemente o produto..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
            />
          </div>

          <Input
            label="URL da Imagem do Produto"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            placeholder="https://exemplo.com/imagem.jpg"
            helperText="Cole o link de uma imagem para aparecer na página de venda"
            leftIcon={<Tag size={18} />}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preço (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="97.00"
              required
              leftIcon={<DollarSign size={18} />}
              fullWidth
            />
            
            <Select
              label="Status"
              value={form.status}
              onChange={value => setForm(f => ({ ...f, status: value as any }))}
              options={statusOptions}
              fullWidth
            />
          </div>

          <Select
            label="Tipo de entrega"
            value={form.delivery_type}
            onChange={value => setForm(f => ({ ...f, delivery_type: value }))}
            options={deliveryTypeOptions}
            fullWidth
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A6178]">
              Instruções de entrega padrão
            </label>
            <textarea
              value={form.default_instructions}
              onChange={e => setForm(f => ({ ...f, default_instructions: e.target.value }))}
              placeholder="Instruções enviadas ao comprador após o pagamento confirmado..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A6178]">
              Texto de suporte
            </label>
            <textarea
              value={form.support_text}
              onChange={e => setForm(f => ({ ...f, support_text: e.target.value }))}
              placeholder="Como o comprador pode entrar em contato para suporte..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] resize-none text-[#081827] placeholder:text-[#71869B]"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deleteProduct?.name}"? Páginas e pedidos vinculados a ele podem ser afetados. Esta ação não pode ser desfeita.`}
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteProduct(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Excluir permanentemente
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
