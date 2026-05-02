import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function interpolateTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(variables[key] ?? match)
  })
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      resolve()
    } catch {
      reject(new Error('Copy failed'))
    }
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    paid: 'text-green-400 bg-green-400/10',
    delivered: 'text-blue-400 bg-blue-400/10',
    expired: 'text-gray-400 bg-gray-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    refunded: 'text-orange-400 bg-orange-400/10',
    paid_pending_stock: 'text-purple-400 bg-purple-400/10',
    failed: 'text-red-500 bg-red-500/10',
    active: 'text-green-400 bg-green-400/10',
    inactive: 'text-gray-400 bg-gray-400/10',
    draft: 'text-yellow-400 bg-yellow-400/10',
    archived: 'text-gray-500 bg-gray-500/10',
    published: 'text-green-400 bg-green-400/10',
    available: 'text-green-400 bg-green-400/10',
    reserved: 'text-yellow-400 bg-yellow-400/10',
    disabled: 'text-gray-400 bg-gray-400/10',
    replaced: 'text-orange-400 bg-orange-400/10',
    open: 'text-blue-400 bg-blue-400/10',
    in_progress: 'text-yellow-400 bg-yellow-400/10',
    resolved: 'text-green-400 bg-green-400/10',
    closed: 'text-gray-400 bg-gray-400/10',
  }
  return colors[status] || 'text-gray-400 bg-gray-400/10'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    delivered: 'Entregue',
    expired: 'Expirado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    paid_pending_stock: 'Pago (Sem Estoque)',
    failed: 'Falhou',
    active: 'Ativo',
    inactive: 'Inativo',
    draft: 'Rascunho',
    archived: 'Arquivado',
    published: 'Publicado',
    available: 'Disponível',
    reserved: 'Reservado',
    disabled: 'Desativado',
    replaced: 'Substituído',
    open: 'Aberto',
    in_progress: 'Em Andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
    digital_credential: 'Credencial Digital',
    file: 'Arquivo',
    link: 'Link',
    custom_text: 'Texto Personalizado',
    license_key: 'Chave de Licença',
    manual: 'Manual',
  }
  return labels[status] || status
}
