'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  leftIcon?: React.ReactNode
  fullWidth?: boolean
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, leftIcon, fullWidth = false, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-[13px] font-semibold text-[#35516B] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {(icon || leftIcon) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71869B]">
              {icon || leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[rgba(8,24,39,0.08)]',
              'bg-white text-[#081827] text-[14px] placeholder:text-[#71869B]',
              'focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15),0_0_18px_rgba(0,194,255,0.12)]',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              (icon || leftIcon) && 'pl-10',
              error && 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-[13px] text-[#DC2626]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-[13px] text-[#71869B]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
