'use client'

import { useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id)
  const current = tabs.find(t => t.id === active)

  return (
    <div className={className}>
      <div className="flex gap-1 p-1 bg-[#F3F7FB] rounded-xl border border-[rgba(8,24,39,0.08)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-[10px] transition-all duration-200',
              active === tab.id
                ? 'bg-white text-[#081827] shadow-[0_2px_8px_rgba(8,24,39,0.08)]'
                : 'text-[#71869B] hover:text-[#35516B] hover:bg-[#EAF1F8]'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{current?.content}</div>
    </div>
  )
}
