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
        'bg-white/80 backdrop-blur-md border border-white/20',
        'rounded-xl shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}