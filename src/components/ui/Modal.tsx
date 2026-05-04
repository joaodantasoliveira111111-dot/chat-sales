'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen = false, onClose, title, description, size = 'md', footer, children, ...props }, ref) => {
    if (!isOpen) return null

    const sizeStyles = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    }

    return (
    <div className="fixed inset-0 z-[1070] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-[rgba(8,24,39,0.5)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          'relative bg-white rounded-[22px] shadow-[var(--shadow-elevated)] w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-[rgba(8,24,39,0.08)]',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(8,24,39,0.08)] flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold text-[#081827]">{title}</h2>
              {description && (
                <p className="text-[13px] text-[#71869B] mt-1">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-[rgba(8,24,39,0.04)] rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-[#71869B]" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[rgba(8,24,39,0.08)] bg-[#F8FBFF] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
    )
  }
)

Modal.displayName = 'Modal'

export default Modal
