'use client'

import { X, AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: React.ReactNode
}

const SIZES = {
  sm: '380px',
  md: '520px',
  lg: '680px',
  xl: '860px',
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="neu-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="neu-modal animate-fade-in-scale"
        style={{ width: '100%', maxWidth: SIZES[size], maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{title}</p>
            <button
              onClick={onClose}
              style={{
                padding: '0.375rem',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Confirm Dialog ----
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Confirmar', variant = 'primary', loading,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="neu-modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="neu-modal animate-fade-in-scale"
        style={{ width: '100%', maxWidth: '420px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <AlertTriangle size={22} style={{ color: variant === 'danger' ? '#F87171' : 'var(--primary-light)' }} />
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>{description}</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
            <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} fullWidth>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
