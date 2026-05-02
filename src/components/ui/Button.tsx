'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth,
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
        'neu-btn',
        `neu-btn-${variant}`,
        `neu-btn-${size}`,
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <>
          <svg
            width="14" height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}
          >
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Carregando...
        </>
      ) : children}
    </button>
  )
}
