'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { GlassCard, Badge } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, slugify, getStatusLabel } from '@/lib/utils'
import { Plus, Package, Edit, Archive, Trash2, ExternalLink, Search, Filter } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface ProductsContentProps {
  products: Product[]
  userId: string
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  delivery_type: '',
  status: 'draft' as 'draft' | 'active' | 'inactive' | 'archived',
  support_text: '',
  default_instructions: '',
}

export function ProductsContent({ products: initialProducts, userId }: ProductsContentProps) {
  const router = useRouter()
  const toast = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const openCreate = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price),
      delivery_type: product.delivery_type || '',
      status: product.status,
      support_text: product.support_text || '',
      default_instructions: product.default_instructions || '',
    })
    setShowForm(true)
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      slug: editProduct ? f.slug : slugify(name),
    }))
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) return toast.error('Nome e slug são obrigatórios')
    setSaving(true)
    try {
      const supabase = createClient()
      const data = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        delivery_type: form.delivery_type || null,
        status: form.status,
        support_text: form.support_text || null,
        default_instructions: form.default_instructions || null,
      }

      if (editProduct) {
        const { error } = await supabase.from('products').update(data).eq('id', editProduct.id)
        if (error) throw error
        setProducts(products.map(p => p.id === editProduct.id ? { ...p, ...data } : p))
        toast.success('Produto atualizado!')
      } else {
        const { data: newProduct, error } = await supabase.from('products').insert({
          ...data,
          id: uuidv4(),
          user_id: userId,
          currency: 'BRL',
        }).select().single()
        if (error) throw error
        setProducts([newProduct, ...products])
        toast.success('Produto criado!')
      }
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message?.includes('slug') ? 'Esse slug já está em uso' : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('products').delete().eq('id', deleteProduct.id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== deleteProduct.id))
      toast.success('Produto removido')
      setDeleteProduct(null)
    } catch {
      toast.error('Erro ao remover produto')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-slate-400 text-sm mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={16} />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Products List */}
      {filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Package size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium mb-2">
            {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
          </p>
          <p className="text-slate-500 text-sm mb-6">
            {products.length === 0 ? 'Crie seu primeiro produto digital para começar a vender.' : 'Tente ajustar os filtros.'}
          </p>
          {products.length === 0 && (
            <Button onClick={openCreate}>
              <Plus size={16} />
              Criar primeiro produto
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {filtered.map(product => (
            <GlassCard key={product.id} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{product.name}</p>
                  <Badge status={product.status} />
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs text-slate-500">/{product.slug}</p>
                  <p className="text-xs text-violet-400 font-semibold">{formatCurrency(product.price)}</p>
                  {product.delivery_type && (
                    <p className="text-xs text-slate-500">{getStatusLabel(product.delivery_type)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  title="Editar"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => setDeleteProduct(product)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nome do produto"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ex: Pack de Templates"
            required
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="pack-de-templates"
            hint="Usado na URL da página pública: /p/seu-slug"
            required
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descreva o produto..."
            rows={3}
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
            />
            <Select
              label="Tipo de entrega"
              value={form.delivery_type}
              onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))}
            >
              <option value="">Selecionar...</option>
              <option value="digital_credential">Credencial Digital</option>
              <option value="file">Arquivo</option>
              <option value="link">Link</option>
              <option value="license_key">Chave de Licença</option>
              <option value="custom_text">Texto Personalizado</option>
              <option value="manual">Manual</option>
            </Select>
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
          >
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="archived">Arquivado</option>
          </Select>
          <Textarea
            label="Instruções padrão de entrega"
            value={form.default_instructions}
            onChange={e => setForm(f => ({ ...f, default_instructions: e.target.value }))}
            placeholder="Instruções enviadas ao comprador após a entrega..."
            rows={3}
          />
          <Textarea
            label="Texto de suporte"
            value={form.support_text}
            onChange={e => setForm(f => ({ ...f, support_text: e.target.value }))}
            placeholder="Como o comprador pode obter suporte..."
            rows={2}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {editProduct ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deleteProduct?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}
