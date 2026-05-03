'use client'

import { cn } from '@/lib/utils'

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('page-container', className)}>{children}</div>
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div className="min-w-0">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}

export function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('section-card', className)}>{children}</section>
}

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('data-table-wrap', className)}>{children}</div>
}
