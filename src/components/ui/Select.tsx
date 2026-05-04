'use client'

import { cn } from '@/lib/utils'
import { forwardRef, useState, useRef, useEffect, useId } from 'react'
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
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const listboxRef = useRef<HTMLDivElement>(null)
    const buttonId = useId()
    const listboxId = useId()
    const labelId = useId()

    const selectedOption = options.find((opt) => opt.value === value)

    const enabledOptions = options.filter((o) => !o.disabled)
    const enabledIndex = (idx: number) => {
      let count = -1
      for (let i = 0; i <= idx && i < options.length; i++) {
        if (!options[i].disabled) count++
      }
      return count
    }

    const handleSelect = (option: SelectOption) => {
      if (!option.disabled) {
        onChange?.(option.value)
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    const open = () => {
      if (!disabled) {
        setIsOpen(true)
        setHighlightedIndex(selectedOption ? options.indexOf(selectedOption) : 0)
      }
    }

    useEffect(() => {
      if (!isOpen) return
      const handleKeyDown = (e: React.KeyboardEvent) => {}
    }, [isOpen])

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault()
          if (!isOpen) {
            open()
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1
              while (next < options.length && options[next].disabled) next++
              return next < options.length ? next : prev
            })
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (!isOpen) {
            open()
          } else {
            setHighlightedIndex((prev) => {
              let next = prev - 1
              while (next >= 0 && options[next].disabled) next--
              return next >= 0 ? next : prev
            })
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
        case 'Home':
          e.preventDefault()
          if (isOpen) setHighlightedIndex(0)
          break
        case 'End':
          e.preventDefault()
          if (isOpen) setHighlightedIndex(options.length - 1)
          break
      }
    }

    const handleOptionKeyDown = (e: React.KeyboardEvent, option: SelectOption, index: number) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleSelect(option)
          break
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => {
            let next = prev + 1
            while (next < options.length && options[next].disabled) next++
            return next < options.length ? next : prev
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => {
            let next = prev - 1
            while (next >= 0 && options[next].disabled) next--
            return next >= 0 ? next : prev
          })
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          triggerRef.current?.focus()
          break
      }
    }

    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
        const items = listboxRef.current.querySelectorAll('[role="option"]')
        items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
      }
    }, [highlightedIndex, isOpen])

    return (
      <div
        ref={ref}
        className={cn('relative', fullWidth && 'w-full', className)}
      >
        {label && (
          <label id={labelId} className="block text-[13px] font-semibold text-[#35516B] mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={triggerRef}
            id={buttonId}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : placeholder}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleTriggerKeyDown}
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
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-[1080]"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              <div
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
                className="absolute z-[1090] w-full mt-1 bg-white border border-[rgba(8,24,39,0.08)] rounded-xl shadow-[var(--shadow-elevated)] max-h-60 overflow-auto"
              >
                {options.map((option, index) => (
                  <button
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option, index)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-2.5 text-[14px] text-left',
                      'flex items-center justify-between',
                      'hover:bg-[rgba(8,24,39,0.04)] transition-colors',
                      index === highlightedIndex && 'bg-[rgba(8,24,39,0.04)]',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      option.value === value && 'bg-[rgba(11,124,255,0.08)] text-[#0B7CFF]'
                    )}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-[13px] text-[#DC2626]" role="alert">{error}</p>
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
