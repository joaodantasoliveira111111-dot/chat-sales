'use client'

import { FlowButton } from '@/types'

interface WhatsAppQuickRepliesProps {
  buttons: FlowButton[]
  onSelect: (button: FlowButton) => void
}

export function WhatsAppQuickReplies({ buttons, onSelect }: WhatsAppQuickRepliesProps) {
  if (!buttons || buttons.length === 0) return null

  return (
    <div className="whatsapp-quick-replies">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          className="whatsapp-quick-reply-button"
          onClick={() => onSelect(button)}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
