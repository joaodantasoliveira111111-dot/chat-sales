'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { FileText, Package, ShoppingCart, AlertCircle } from 'lucide-react'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const iconMap = {
  products: <Package className="w-12 h-12 text-slate-300" />,
  orders: <ShoppingCart className="w-12 h-12 text-slate-300" />,
  pages: <FileText className="w-12 h-12 text-slate-300" />,
  default: <AlertCircle className="w-12 h-12 text-slate-300" />,
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className,
  ...props 
}: EmptyStateProps) {
  const displayIcon = icon || iconMap.default

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      <div className="mb-4">{displayIcon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState