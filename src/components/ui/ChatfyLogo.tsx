'use client'

import { cn } from '@/lib/utils'

interface ChatfyLogoProps {
  className?: string
  markClassName?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ChatfyLogo({ 
  className, 
  markClassName, 
  showWordmark = true,
  size = 'md'
}: ChatfyLogoProps) {
  const sizeStyles = {
    sm: {
      mark: 'w-8 h-8',
      text: 'text-base',
      tagline: 'text-xs'
    },
    md: {
      mark: 'w-10 h-10',
      text: 'text-xl',
      tagline: 'text-xs'
    },
    lg: {
      mark: 'w-12 h-12',
      text: 'text-2xl',
      tagline: 'text-sm'
    }
  }

  const currentSize = sizeStyles[size]

  return (
    <div className={cn('chatfy-logo', className)}>
      <div className={cn('chatfy-logo-mark', currentSize.mark, markClassName)} aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img" focusable="false" className="w-full h-full">
          <path d="M8 8.6C8 6.6 9.6 5 11.6 5h8.8C22.4 5 24 6.6 24 8.6v5.2c0 2-1.6 3.6-3.6 3.6h-5.1l-4.1 3.5c-.7.6-1.8.1-1.8-.8v-2.7C8.6 16.9 8 15.8 8 14.6v-6Z" />
          <path d="M17.4 19.7h3.2c1.1 0 2.1-.3 3-.9v1.6c0 2-1.6 3.6-3.6 3.6h-5.1l-3.1 2.7c-.7.6-1.8.1-1.8-.8v-1.8l4.1-3.5c.9-.6 1.9-.9 3.3-.9Z" opacity=".72" />
          <circle cx="12.8" cy="11.3" r="1.25" />
          <circle cx="16" cy="11.3" r="1.25" />
          <circle cx="19.2" cy="11.3" r="1.25" />
        </svg>
      </div>
      {showWordmark && (
        <div className="chatfy-logo-text">
          <span className={cn('brand-name', currentSize.text)}>Chatfy</span>
          <span className={cn('brand-tagline', currentSize.tagline)}>Sales automation</span>
        </div>
      )}
    </div>
  )
}