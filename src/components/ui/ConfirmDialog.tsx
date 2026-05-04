'use client'

import { forwardRef, HTMLAttributes } from 'react'
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
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-[1070] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[rgba(8,24,39,0.5)] backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={ref}
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
                  <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#081827] mb-2">{title}</h3>
                {description && (
                  <p className="text-[14px] text-[#71869B]">{description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-[#F8FBFF] border-t border-[rgba(8,24,39,0.08)] flex justify-end gap-3">
            <button
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
