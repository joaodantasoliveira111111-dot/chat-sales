'use client'

import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'neu' | 'neu-soft' | 'flat'
  hoverable?: boolean
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'neu', hoverable = false, children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white border border-[rgba(8,24,39,0.08)] shadow-[var(--shadow-neu-raised-subtle)]',
      elevated: 'bg-white border border-[rgba(8,24,39,0.08)] shadow-[var(--shadow-elevated)]',
      outlined: 'bg-white border-2 border-[rgba(8,24,39,0.14)]',
      neu: 'bg-white border border-[rgba(8,24,39,0.08)] shadow-[10px_10px_24px_rgba(8,24,39,0.06),-8px_-8px_20px_rgba(255,255,255,0.8)]',
      'neu-soft': 'bg-[#F8FBFF] border border-[rgba(8,24,39,0.06)] shadow-[6px_6px_16px_rgba(8,24,39,0.04),-4px_-4px_12px_rgba(255,255,255,0.7)]',
      flat: 'bg-white border border-[rgba(8,24,39,0.08)] shadow-[0_1px_3px_rgba(8,24,39,0.04),0_1px_2px_rgba(8,24,39,0.02)]',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[22px] overflow-hidden',
          variantStyles[variant],
          hoverable && 'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[14px_14px_32px_rgba(8,24,39,0.08),-10px_-10px_24px_rgba(255,255,255,0.9)] hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-[#081827] leading-none tracking-tight', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-[#71869B]', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export default Card
