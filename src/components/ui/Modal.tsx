'use client'

import { forwardRef, HTMLAttributes, useEffect, useRef, useCallback, useId } from 'react'
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
    const internalRef = useRef<HTMLDivElement>(null)
    const previouslyFocused = useRef<HTMLElement | null>(null)
    const headingId = useId()
    const descId = useId()

    const setRef = useCallback((el: HTMLDivElement | null) => {
      internalRef.current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
    }, [ref])

    useEffect(() => {
      if (!isOpen) return
      previouslyFocused.current = document.activeElement as HTMLElement
      const modal = internalRef.current
      if (modal) {
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length) focusable[0].focus()
      }
      return () => {
        if (previouslyFocused.current) previouslyFocused.current.focus()
      }
    }, [isOpen])

    useEffect(() => {
      if (!isOpen) return
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onClose?.()
          return
        }
        if (e.key !== 'Tab') return
        const modal = internalRef.current
        if (!modal) return
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

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
          aria-hidden="true"
        />
        <div
          ref={setRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? headingId : undefined}
          aria-describedby={description ? descId : undefined}
          className={cn(
            'relative bg-white rounded-[22px] shadow-[var(--shadow-elevated)] w-full mx-4 max-h-[85vh] flex flex-col border border-[rgba(8,24,39,0.08)]',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(8,24,39,0.08)] flex-shrink-0">
              <div>
                <h2 id={headingId} className="text-xl font-semibold text-[#081827]">{title}</h2>
                {description && (
                  <p id={descId} className="text-[13px] text-[#71869B] mt-1">{description}</p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  aria-label="Fechar"
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
