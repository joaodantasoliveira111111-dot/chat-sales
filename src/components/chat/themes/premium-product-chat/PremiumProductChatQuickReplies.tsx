'use client'

import { FlowButton } from '@/types'
import { ChevronRight } from 'lucide-react'

interface PremiumProductChatQuickRepliesProps {
  buttons: FlowButton[]
  onSelect: (button: FlowButton) => void
}

export function PremiumProductChatQuickReplies({ buttons, onSelect }: PremiumProductChatQuickRepliesProps) {
  if (!buttons || buttons.length === 0) return null

  const isPlanGroup = buttons.some(b => (b as any).price != null || (b as any).plan_price != null)

  if (isPlanGroup) {
    return (
      <div className="ppc-plan-cards">
        {buttons.map((button) => {
          const btn = button as any
          const price = btn.price ?? btn.plan_price
          const badge = btn.badge ?? btn.plan_badge
          return (
            <button
              key={button.id}
              type="button"
              className="ppc-plan-card"
              onClick={() => onSelect(button)}
            >
              <div className="ppc-plan-card-left">
                <span className="ppc-plan-icon-capsule">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </span>
                <div className="ppc-plan-card-info">
                  <span className="ppc-plan-card-name">{button.label}</span>
                  {price != null && (
                    <span className="ppc-plan-card-price">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(price))}
                    </span>
                  )}
                </div>
              </div>
              <div className="ppc-plan-card-right">
                {badge && <span className="ppc-plan-card-badge">{String(badge)}</span>}
                <ChevronRight size={18} className="ppc-plan-card-chevron" />
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="ppc-quick-replies">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          className="ppc-quick-reply-button"
          onClick={() => onSelect(button)}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
