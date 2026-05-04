'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-semibold text-[#35516B] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[120px] px-4 py-2.5 rounded-xl border border-[rgba(8,24,39,0.08)]',
            'bg-white text-[#081827] text-[14px] placeholder:text-[#71869B]',
            'focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15),0_0_18px_rgba(0,194,255,0.12)]',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none',
            error && 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-[13px] text-[#71869B]">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-[13px] text-[#DC2626]">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
