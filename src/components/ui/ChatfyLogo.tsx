'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ChatfyLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function ChatfyLogo({ className, size = 'md', ...props }: ChatfyLogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        sizes[size],
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect width="40" height="40" rx="8" fill="#2563EB" />
        <path
          d="M12 12C12 10.8954 12.8954 10 14 10H26C27.1046 10 28 10.8954 28 13V20C28 21.1046 27.1046 22 26 22H18L14 26V22H14C12.8954 22 12 21.1046 12 20V12Z"
          fill="white"
        />
      </svg>
    </div>
  )
}