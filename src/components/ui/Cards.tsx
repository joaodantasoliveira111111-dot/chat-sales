'use client'

import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'

interface BadgeProps {
  status: string
  label?: string
  className?: string
}

export function Badge({ status, label, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      getStatusColor(status),
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label || getStatusLabel(status)}
    </span>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function GlassCard({ children, className, onClick, hover }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl p-5 glass',
        hover && 'cursor-pointer hover:bg-white/8 transition-all duration-200 hover:border-white/15',
        className
      )}
    >
      {children}
    </div>
  )
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'violet',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: 'violet' | 'cyan' | 'green' | 'orange' | 'red' | 'blue'
}) {
  const colors = {
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
  }

  return (
    <div className={cn(
      'rounded-2xl p-5 bg-gradient-to-br border transition-all duration-200 hover:scale-[1.01]',
      colors[color]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl bg-white/5', colors[color])}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.value >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
