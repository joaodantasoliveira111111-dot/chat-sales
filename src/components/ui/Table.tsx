'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  columns: string[]
  data: Array<Record<string, any>>
  emptyMessage?: string
}

export function Table({ 
  columns, 
  data, 
  emptyMessage = 'Nenhum dado encontrado',
  className,
  ...props 
}: TableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'w-full border-collapse',
          className
        )}
        {...props}
      >
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-sm text-slate-700"
                >
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table