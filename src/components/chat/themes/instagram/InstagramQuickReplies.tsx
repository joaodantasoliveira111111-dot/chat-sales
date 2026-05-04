'use client'

import { FlowButton } from '@/types'

interface InstagramQuickRepliesProps {
  buttons: FlowButton[]
  onSelect: (button: FlowButton) => void
}

export function InstagramQuickReplies({ buttons, onSelect }: InstagramQuickRepliesProps) {
  if (!buttons || buttons.length === 0) return null

  return (
    <div className="instagram-quick-replies">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          className="instagram-quick-reply-button"
          onClick={() => onSelect(button)}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
