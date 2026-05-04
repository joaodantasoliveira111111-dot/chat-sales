'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-[rgba(8,24,39,0.08)]',
        'rounded-[22px] shadow-[10px_10px_24px_rgba(8,24,39,0.06),-8px_-8px_20px_rgba(255,255,255,0.8)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
