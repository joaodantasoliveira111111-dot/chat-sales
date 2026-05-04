'use client'

import { ChatMessage } from '@/types'

interface InstagramMessageBubbleProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function InstagramMessageBubble({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: InstagramMessageBubbleProps) {
  const time = formatTime(message.timestamp)

  return (
    <div className={`instagram-message-row ${isUser ? 'instagram-message-row-user' : 'instagram-message-row-bot'} ${compact ? 'instagram-message-row-compact' : ''}`}>
      <div className={`instagram-message-bubble ${isUser ? 'instagram-message-bubble-user' : 'instagram-message-bubble-bot'}`}>
        <span className="instagram-message-text">{message.content}</span>
        <span className="instagram-message-time">{time}</span>
      </div>
    </div>
  )
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
