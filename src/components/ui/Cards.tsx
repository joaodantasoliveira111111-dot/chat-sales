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
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  elevated?: boolean
  as?: 'div' | 'section' | 'article'
}

export function Card({ children, className, style, onClick, hover, elevated, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        elevated ? 'neu-card-elevated' : 'neu-card',
        hover && 'cursor-pointer',
        className
      )}
      style={{ padding: '1.25rem', ...style }}
    >
      {children}
    </Tag>
  )
}

// Keep old name for backward compat
export function GlassCard({ children, className, style, onClick, hover }: CardProps) {
  return (
    <Card className={className} style={style} onClick={onClick} hover={hover}>
      {children}
    </Card>
  )
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
  violet: { border: 'rgba(99,91,255,0.18)', icon: 'rgba(99,91,255,0.1)', text: '#635BFF', bg: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(239,249,255,0.78))' },
  cyan:   { border: 'rgba(0,184,255,0.2)', icon: 'rgba(0,184,255,0.12)', text: '#008FEF', bg: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(221,243,255,0.82))' },
  green:  { border: 'rgba(22,199,132,0.22)', icon: 'rgba(22,199,132,0.12)', text: '#16C784', bg: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(235,255,247,0.82))' },
  orange: { border: 'rgba(245,158,11,0.22)', icon: 'rgba(245,158,11,0.12)', text: '#D97706', bg: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,248,232,0.82))' },
  red:    { border: 'rgba(239,68,68,0.2)', icon: 'rgba(239,68,68,0.1)', text: '#EF4444', bg: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,241,242,0.82))' },
  blue:   { border: 'rgba(0,143,239,0.22)', icon: 'rgba(0,143,239,0.12)', text: '#006DCC', bg: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,249,255,0.82))' },
}

export function MetricCard({ title, value, subtitle, icon, color = 'violet', trend }: MetricCardProps) {
  const c = METRIC_COLORS[color]
  return (
    <div
      className="metric-card"
      style={{
        borderColor: c.border,
        background: c.bg,
      }}
    >
      <div className="metric-card-topline">
        <div
          className="metric-card-icon"
          style={{
            background: c.icon,
            color: c.text,
          }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="metric-card-trend"
            style={{
              color: trend.value >= 0 ? '#16C784' : '#EF4444',
              background: trend.value >= 0 ? 'rgba(22,199,132,0.1)' : 'rgba(239,68,68,0.1)',
            }}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="metric-card-value">{value}</p>
      <p className="metric-card-title">{title}</p>
      {subtitle && <p className="metric-card-subtitle">{subtitle}</p>}
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
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon}
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action}
    </div>
  )
}
