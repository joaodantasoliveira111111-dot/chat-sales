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
      <div className="text-center py-12 text-[#71869B]">
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
          <tr className="border-b border-[rgba(8,24,39,0.08)] bg-[#F3F7FB]">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-[11px] font-semibold text-[#71869B] uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(8,24,39,0.08)]">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-[#F3F7FB] transition-colors">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-sm text-[#35516B]"
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