'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card, Badge, EmptyState } from '@/components/ui/Cards'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency, slugify } from '@/lib/utils'
import { Plus, Package, Edit, Trash2, Search, ExternalLink, DollarSign, Tag } from 'lucide-react'
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
  image_url: '',
  delivery_type: '' as string,
  status: 'draft' as 'draft' | 'active' | 'inactive' | 'archived',
  support_text: '',
  default_instructions: '',
}

export function ProductsContent({ products: initialProducts, userId }: ProductsContentProps) {
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
    setShowForm(true)
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: editProduct ? f.slug : slugify(name) }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Nome é obrigatório')
    if (!form.slug.trim()) return toast.error('Slug é obrigatório')
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
        const { error } = await supabase.from('products').update(data).eq('id', editProduct.id)
        if (error) throw error
        setProducts(products.map(p => p.id === editProduct.id ? { ...p, ...data } as any : p))
        toast.success('Produto atualizado!')
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({ ...data, id: uuidv4(), user_id: userId, currency: 'BRL' })
          .select()
          .single()
        if (error) throw error
        setProducts([newProduct, ...products])
        toast.success('Produto criado com sucesso!')
      }
      setShowForm(false)
    } catch (err: any) {
      toast.error(err.message?.includes('slug') ? 'Esse slug já está em uso' : 'Erro ao salvar produto')
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
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>Produtos</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} size="md">
          <Plus size={15} />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="neu-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="neu-input"
          style={{ width: 'auto', minWidth: '150px' }}
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
        <Card>
          <EmptyState
            icon={<Package size={24} />}
            title={products.length === 0 ? 'Nenhum produto ainda' : 'Nenhum resultado'}
            description={products.length === 0 ? 'Crie seu primeiro produto digital para começar a vender.' : 'Tente ajustar os filtros de busca.'}
            action={products.length === 0 ? (
              <Button onClick={openCreate} size="sm">
                <Plus size={14} />
                Criar primeiro produto
              </Button>
            ) : undefined}
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map(product => (
            <Card key={product.id} hover>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Icon / Image */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: product.image_url ? undefined : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={20} style={{ color: '#fff' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>{product.name}</span>
                    <Badge status={product.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>/{product.slug}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A78BFA' }}>
                      {formatCurrency(product.price)}
                    </span>
                    {product.delivery_type && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{product.delivery_type.replace(/_/g, ' ')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a
                    href={`/p/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver página pública"
                    style={{
                      padding: '0.5rem', borderRadius: '8px',
                      color: 'var(--text-subtle)', display: 'flex',
                      transition: 'all 0.15s', textDecoration: 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => openEdit(product)}
                    title="Editar"
                    style={{
                      padding: '0.5rem', borderRadius: '8px', background: 'transparent',
                      border: 'none', color: 'var(--text-subtle)', cursor: 'pointer',
                      display: 'flex', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteProduct(product)}
                    title="Excluir"
                    style={{
                      padding: '0.5rem', borderRadius: '8px', background: 'transparent',
                      border: 'none', color: 'var(--text-subtle)', cursor: 'pointer',
                      display: 'flex', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
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
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setShowForm(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleSave} loading={saving} fullWidth>
              {editProduct ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Nome do produto"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Ex: Acesso Premium — Curso de Vendas"
            required
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            placeholder="acesso-premium-curso-de-vendas"
            hint="Usado na URL pública: chatfy.com/p/seu-slug"
            required
          />
          <Textarea
            label="Descrição"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descreva brevemente o produto..."
            rows={3}
          />
          <Input
            label="URL da Imagem do Produto"
            value={form.image_url}
            onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            placeholder="https://exemplo.com/imagem.jpg"
            hint="Cole o link de uma imagem para aparecer na página de venda"
            prefix={<Tag size={13} />}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Preço (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="97.00"
              required
              prefix={<DollarSign size={13} />}
            />
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
          </div>
          <Select
            label="Tipo de entrega"
            value={form.delivery_type}
            onChange={e => setForm(f => ({ ...f, delivery_type: e.target.value }))}
          >
            <option value="">Selecionar tipo...</option>
            <option value="digital_credential">Credencial Digital (e-mail + senha)</option>
            <option value="file">Arquivo</option>
            <option value="link">Link de acesso</option>
            <option value="license_key">Chave de Licença</option>
            <option value="custom_text">Texto Personalizado</option>
            <option value="manual">Entrega Manual</option>
          </Select>
          <Textarea
            label="Instruções de entrega padrão"
            value={form.default_instructions}
            onChange={e => setForm(f => ({ ...f, default_instructions: e.target.value }))}
            placeholder="Instruções enviadas ao comprador após o pagamento confirmado..."
            rows={3}
          />
          <Textarea
            label="Texto de suporte"
            value={form.support_text}
            onChange={e => setForm(f => ({ ...f, support_text: e.target.value }))}
            placeholder="Como o comprador pode entrar em contato para suporte..."
            rows={2}
          />
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${deleteProduct?.name}"? Páginas e pedidos vinculados a ele podem ser afetados. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir permanentemente"
        variant="danger"
      />
    </div>
  )
}
