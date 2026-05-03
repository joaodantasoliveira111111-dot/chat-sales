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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            'relative bg-white rounded-xl shadow-2xl w-full mx-4 overflow-hidden max-w-md',
            className
          )}
          {...props}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                {description && (
                  <p className="text-sm text-slate-600">{description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
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