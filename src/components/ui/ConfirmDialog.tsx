'use client'

import { forwardRef, HTMLAttributes, useEffect, useRef, useCallback, useId } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onClose?: () => void
  onConfirm?: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmLabel?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  ({
    className,
    isOpen = false,
    onClose,
    onConfirm,
    title = 'Confirmar ação',
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false,
    ...props
  }, ref) => {
    const cancelRef = useRef<HTMLButtonElement>(null)
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
      cancelRef.current?.focus()
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
        const dialog = internalRef.current
        if (!dialog) return
        const focusable = dialog.querySelectorAll<HTMLElement>(
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

    return (
      <div className="fixed inset-0 z-[1070] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[rgba(8,24,39,0.5)] backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={setRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={headingId}
          aria-describedby={description ? descId : undefined}
          className={cn(
            'relative bg-white rounded-[22px] shadow-[var(--shadow-elevated)] w-full mx-4 overflow-hidden max-w-md border border-[rgba(8,24,39,0.08)]',
            className
          )}
          {...props}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[rgba(220,38,38,0.08)] flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#DC2626]" aria-hidden="true" />
                </div>
              </div>
              <div className="flex-1">
                <h3 id={headingId} className="text-xl font-semibold text-[#081827] mb-2">{title}</h3>
                {description && (
                  <p id={descId} className="text-[14px] text-[#71869B]">{description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-[#F8FBFF] border-t border-[rgba(8,24,39,0.08)] flex justify-end gap-3">
            <button
              ref={cancelRef}
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-[14px] font-medium text-[#35516B] hover:bg-[rgba(8,24,39,0.04)] rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2.5 text-[14px] font-medium text-white bg-[#DC2626] hover:bg-[#B91C1C] hover:shadow-[0_0_18px_rgba(220,38,38,0.2)] rounded-xl transition-all disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    )
  }
)

ConfirmDialog.displayName = 'ConfirmDialog'

export default ConfirmDialog
