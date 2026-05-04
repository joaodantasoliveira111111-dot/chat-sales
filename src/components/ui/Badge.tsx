'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  status?: string
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#EAF1F8] text-[#35516B] border-[rgba(8,24,39,0.08)]',
      success: 'bg-[rgba(22,163,74,0.08)] text-[#16A34A] border-[rgba(22,163,74,0.12)]',
      warning: 'bg-[rgba(249,115,22,0.08)] text-[#F97316] border-[rgba(249,115,22,0.12)]',
      danger: 'bg-[rgba(220,38,38,0.08)] text-[#DC2626] border-[rgba(220,38,38,0.12)]',
      info: 'bg-[rgba(11,124,255,0.08)] text-[#0B7CFF] border-[rgba(11,124,255,0.12)]',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-[11px]',
      md: 'px-2.5 py-1 text-[13px]',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-semibold rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
