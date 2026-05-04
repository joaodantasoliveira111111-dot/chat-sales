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
  hint?: string
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
      hint,
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
          <label className="block text-[13px] font-semibold text-[#35516B] mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full min-h-[48px] px-4 py-2.5',
              'text-[14px] text-left text-[#081827]',
              'bg-white border border-[rgba(8,24,39,0.08)] rounded-xl',
              'focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15),0_0_18px_rgba(0,194,255,0.12)]',
              'disabled:bg-[#F8FBFF] disabled:text-[#71869B] disabled:cursor-not-allowed',
              'transition-all duration-200',
              error && 'border-[#DC2626] focus:border-[#DC2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]',
              'flex items-center justify-between'
            )}
          >
            <span className={cn(!selectedOption && 'text-[#71869B]')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-[#71869B] transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-[1080]"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-[1090] w-full mt-1 bg-white border border-[rgba(8,24,39,0.08)] rounded-xl shadow-[var(--shadow-elevated)] max-h-60 overflow-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-2.5 text-[14px] text-left',
                      'flex items-center justify-between',
                      'hover:bg-[rgba(8,24,39,0.04)] transition-colors',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      option.value === value && 'bg-[rgba(11,124,255,0.08)] text-[#0B7CFF]'
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
          <p className="mt-1.5 text-[13px] text-[#DC2626]">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-[13px] text-[#71869B]">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
