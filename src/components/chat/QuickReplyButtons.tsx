'use client'

import { FlowButton } from '@/types'

interface QuickReplyButtonsProps {
  buttons: FlowButton[]
  onSelect: (button: FlowButton) => void
}

export function QuickReplyButtons({ buttons, onSelect }: QuickReplyButtonsProps) {
  if (buttons.length === 0) return null

  return (
    <div className="quick-reply-row">
      <div className="message-avatar-slot" />
      <div className="quick-reply-stack">
        {buttons.map(button => (
          <button
            key={button.id}
            type="button"
            className="quick-reply-button"
            onClick={() => onSelect(button)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}
