'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped'
}

export function Table({
  className,
  variant = 'default',
  children,
  ...props
}: TableProps) {
  const variantStyles = {
    default: 'border-collapse',
    bordered: 'border-collapse border border-slate-200',
    striped: 'border-collapse',
  }

  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full', variantStyles[variant], className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-slate-50', className)} {...props} />
  )
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-slate-200', className)} {...props} />
  )
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'hover:bg-slate-50 transition-colors',
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider',
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-slate-700',
        className
      )}
      {...props}
    />
  )
}