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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            'relative bg-white rounded-xl shadow-2xl w-full mx-4 overflow-hidden',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                {description && (
                  <p className="text-sm text-slate-500 mt-1">{description}</p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              )}
            </div>
          )}
          <div className="p-6">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
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