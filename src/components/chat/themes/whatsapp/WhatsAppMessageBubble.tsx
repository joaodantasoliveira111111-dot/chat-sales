'use client'

import { ChatMessage } from '@/types'

interface WhatsAppMessageBubbleProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function WhatsAppMessageBubble({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: WhatsAppMessageBubbleProps) {
  const time = formatTime(message.timestamp)

  return (
    <div className={`whatsapp-message-row ${isUser ? 'whatsapp-message-row-user' : 'whatsapp-message-row-bot'} ${compact ? 'whatsapp-message-row-compact' : ''}`}>
      {!isUser && (
        <div className="whatsapp-message-avatar-slot">
          {showAvatar && (
            avatarUrl ? (
              <img src={avatarUrl} alt="" className="whatsapp-message-avatar" />
            ) : (
              <div className="whatsapp-message-avatar whatsapp-message-avatar-fallback">C</div>
            )
          )}
        </div>
      )}
      <div className={`whatsapp-message-bubble ${isUser ? 'whatsapp-message-bubble-user' : 'whatsapp-message-bubble-bot'}`}>
        <span className="whatsapp-message-text">{message.content}</span>
        <span className="whatsapp-message-time">
          {time}
          {isUser && <span className="whatsapp-message-check">✓✓</span>}
        </span>
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
