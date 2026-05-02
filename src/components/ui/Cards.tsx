'use client'

import { cn } from '@/lib/utils'

// ---- Badge ----
interface BadgeProps {
  status: string
  label?: string
  className?: string
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:      { label: 'Rascunho',   cls: 'status-draft' },
  active:     { label: 'Ativo',      cls: 'status-active' },
  inactive:   { label: 'Inativo',    cls: 'status-inactive' },
  archived:   { label: 'Arquivado',  cls: 'status-archived' },
  published:  { label: 'Publicado',  cls: 'status-published' },
  pending:    { label: 'Pendente',   cls: 'status-pending' },
  paid:       { label: 'Pago',       cls: 'status-paid' },
  delivered:  { label: 'Entregue',   cls: 'status-delivered' },
  expired:    { label: 'Expirado',   cls: 'status-expired' },
  cancelled:  { label: 'Cancelado',  cls: 'status-cancelled' },
  available:  { label: 'Disponível', cls: 'status-available' },
  open:       { label: 'Aberto',     cls: 'status-open' },
  resolved:   { label: 'Resolvido',  cls: 'status-resolved' },
}

export function Badge({ status, label, className }: BadgeProps) {
  const map = STATUS_MAP[status] || { label: status, cls: 'status-draft' }
  return (
    <span className={cn('neu-badge', map.cls, className)}>
      <span className="neu-badge-dot" />
      {label || map.label}
    </span>
  )
}

// ---- Card ----
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  elevated?: boolean
  as?: 'div' | 'section' | 'article'
}

export function Card({ children, className, onClick, hover, elevated, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        elevated ? 'neu-card-elevated' : 'neu-card',
        hover && 'cursor-pointer',
        className
      )}
      style={{ padding: '1.25rem' }}
    >
      {children}
    </Tag>
  )
}

// Keep old name for backward compat
export function GlassCard({ children, className, onClick, hover }: CardProps) {
  return <Card children={children} className={className} onClick={onClick} hover={hover} />
}

// ---- Metric Card ----
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color?: 'violet' | 'cyan' | 'green' | 'orange' | 'red' | 'blue'
  trend?: { value: number; label: string }
}

const METRIC_COLORS = {
  violet: { border: 'rgba(124,58,237,0.3)', icon: 'rgba(124,58,237,0.15)', text: '#A78BFA', bg: 'rgba(124,58,237,0.07)' },
  cyan:   { border: 'rgba(6,182,212,0.3)',  icon: 'rgba(6,182,212,0.15)',  text: '#67E8F9', bg: 'rgba(6,182,212,0.07)' },
  green:  { border: 'rgba(16,185,129,0.3)', icon: 'rgba(16,185,129,0.15)', text: '#34D399', bg: 'rgba(16,185,129,0.07)' },
  orange: { border: 'rgba(249,115,22,0.3)', icon: 'rgba(249,115,22,0.15)', text: '#FB923C', bg: 'rgba(249,115,22,0.07)' },
  red:    { border: 'rgba(239,68,68,0.3)',  icon: 'rgba(239,68,68,0.15)',  text: '#F87171', bg: 'rgba(239,68,68,0.07)' },
  blue:   { border: 'rgba(59,130,246,0.3)', icon: 'rgba(59,130,246,0.15)', text: '#60A5FA', bg: 'rgba(59,130,246,0.07)' },
}

export function MetricCard({ title, value, subtitle, icon, color = 'violet', trend }: MetricCardProps) {
  const c = METRIC_COLORS[color]
  return (
    <div
      className="neu-card transition-all duration-200 hover:scale-[1.01]"
      style={{
        padding: '1.25rem',
        borderColor: c.border,
        background: c.bg,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div
          style={{
            padding: '0.625rem',
            borderRadius: '10px',
            background: c.icon,
            color: c.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>
        {trend && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
              color: trend.value >= 0 ? '#34D399' : '#F87171',
              background: trend.value >= 0 ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
            }}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p style={{ fontSize: '1.625rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.375rem' }}>{value}</p>
      <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>{subtitle}</p>}
    </div>
  )
}

// ---- Empty State ----
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px', height: '56px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-subtle)',
        marginBottom: '1rem',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>{title}</p>
      {description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.5, marginBottom: '1.25rem' }}>{description}</p>}
      {action}
    </div>
  )
}
