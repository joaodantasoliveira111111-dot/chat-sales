'use client'

import { cn } from '@/lib/utils'
import { forwardRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      value,
      onChange,
      placeholder = 'Selecione uma opção',
      disabled = false,
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find((opt) => opt.value === value)

    const handleSelect = (option: SelectOption) => {
      if (!option.disabled) {
        onChange?.(option.value)
        setIsOpen(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('relative', fullWidth && 'w-full', className)}
      >
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3 py-2',
              'text-sm text-left text-slate-900',
              'bg-white border border-slate-300 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'border-red-300 focus:ring-red-500',
              'flex items-center justify-between'
            )}
          >
            <span className={cn(!selectedOption && 'text-slate-400')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left',
                      'flex items-center justify-between',
                      'hover:bg-slate-50 transition-colors',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      option.value === value && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select