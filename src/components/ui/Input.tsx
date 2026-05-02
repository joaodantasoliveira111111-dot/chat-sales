'use client'

import { cn } from '@/lib/utils'

// ---- Input ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export function Input({ label, hint, error, prefix, suffix, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '0.375rem',
            letterSpacing: '0.01em',
          }}
        >
          {label}
          {props.required && <span style={{ color: '#F87171', marginLeft: '0.2rem' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <div style={{
            position: 'absolute', left: '0.75rem',
            color: 'var(--text-subtle)',
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={cn('neu-input', className)}
          style={{
            paddingLeft: prefix ? '2.25rem' : undefined,
            paddingRight: suffix ? '2.25rem' : undefined,
            borderColor: error ? 'rgba(239,68,68,0.5)' : undefined,
            ...(props.style || {}),
          }}
        />
        {suffix && (
          <div style={{
            position: 'absolute', right: '0.75rem',
            color: 'var(--text-subtle)',
            pointerEvents: 'none',
            display: 'flex', alignItems: 'center',
          }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  )
}

// ---- Textarea ----
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '0.375rem',
          }}
        >
          {label}
          {props.required && <span style={{ color: '#F87171', marginLeft: '0.2rem' }}>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={cn('neu-input', className)}
        style={{
          resize: 'vertical',
          minHeight: '80px',
          borderColor: error ? 'rgba(239,68,68,0.5)' : undefined,
          ...(props.style || {}),
        }}
      />
      {error && <p style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  )
}

// ---- Select ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '0.375rem',
          }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        {...props}
        className={cn('neu-input', className)}
        style={{
          cursor: 'pointer',
          borderColor: error ? 'rgba(239,68,68,0.5)' : undefined,
          ...(props.style || {}),
        }}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '0.3rem' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  )
}
