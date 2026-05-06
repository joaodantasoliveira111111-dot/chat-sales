'use client'

import { ChatMessage } from '@/types'

interface PremiumProductChatMessageBubbleProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function PremiumProductChatMessageBubble({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: PremiumProductChatMessageBubbleProps) {
  const time = formatTime(message.timestamp)

  return (
    <div className={`ppc-message-row ${isUser ? 'ppc-message-row-user' : 'ppc-message-row-bot'} ${compact ? 'ppc-message-row-compact' : ''}`}>
      {!isUser && showAvatar && (
        <div className="ppc-avatar-slot">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="ppc-avatar" />
          ) : (
            <div className="ppc-avatar ppc-avatar-fallback">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
          )}
        </div>
      )}
      <div className={`ppc-message-bubble ${isUser ? 'ppc-message-bubble-user' : 'ppc-message-bubble-bot'}`}>
        <span className="ppc-message-text">{message.content}</span>
        <span className="ppc-message-time">{time}</span>
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
