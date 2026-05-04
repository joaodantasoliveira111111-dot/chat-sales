'use client'

import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1.5 mt-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        leftIcon={<ChevronLeft size={14} />}
      >
        Anterior
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-[#71869B]">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              `min-w-[36px] h-9 rounded-xl text-sm font-medium transition-colors ` +
              (p === page
                ? 'bg-[#0B7CFF] text-white shadow-[0_2px_8px_rgba(11,124,255,0.3)]'
                : 'text-[#35516B] hover:bg-[rgba(8,24,39,0.04)]')
            }
          >
            {p}
          </button>
        )
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        rightIcon={<ChevronRight size={14} />}
      >
        Próximo
      </Button>
    </nav>
  )
}

export default Pagination
