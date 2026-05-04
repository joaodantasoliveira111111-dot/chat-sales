'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:shadow-[inset_4px_4px_8px_rgba(8,24,39,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.6)]'

    const variants = {
      primary: 'bg-[#0B7CFF] text-white hover:bg-[#0A6FE6] hover:shadow-[0_0_18px_rgba(11,124,255,0.25)] focus:ring-2 focus:ring-[#0B7CFF]/30 focus:ring-offset-2 shadow-[0_2px_8px_rgba(11,124,255,0.2)]',
      secondary: 'bg-[#F8FBFF] text-[#35516B] hover:bg-[#EAF1F8] focus:ring-2 focus:ring-[rgba(8,24,39,0.08)] focus:ring-offset-2 border border-[rgba(8,24,39,0.08)]',
      outline: 'border-2 border-[rgba(8,24,39,0.14)] text-[#35516B] hover:bg-[#F8FBFF] focus:ring-2 focus:ring-[rgba(8,24,39,0.08)] focus:ring-offset-2',
      ghost: 'text-[#35516B] hover:bg-[rgba(8,24,39,0.04)] focus:ring-2 focus:ring-[rgba(8,24,39,0.08)] focus:ring-offset-2',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] hover:shadow-[0_0_18px_rgba(220,38,38,0.2)] focus:ring-2 focus:ring-[#DC2626]/30 focus:ring-offset-2 shadow-[0_2px_8px_rgba(220,38,38,0.15)]',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-[13px] h-8',
      md: 'px-4 py-2.5 text-[14px] h-10',
      lg: 'px-6 py-3 text-[16px] h-12',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
