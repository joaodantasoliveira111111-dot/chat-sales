'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
}

const variantStyles = {
  primary: 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:border-primary-700 focus:ring-primary-500 shadow-sm',
  secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 shadow-sm',
  ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 focus:ring-slate-500',
  danger: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 focus:ring-red-500',
  outline: 'bg-transparent text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-lg border transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span className="flex-shrink-0">{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  )
}