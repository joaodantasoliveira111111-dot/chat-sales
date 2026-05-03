'use client'

import { ChatMessage, ThemeConfig } from '@/types'

interface MessageBubbleProps {
  message: ChatMessage
  theme: ThemeConfig
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function MessageBubble({
  message,
  theme,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: MessageBubbleProps) {
  const bubbleStyle = isUser
    ? {
        background: theme.userBubble || '#D9FDD3',
        color: theme.userText || '#111B21',
      }
    : {
        background: theme.assistantBubble || '#FFFFFF',
        color: theme.assistantText || '#111B21',
        borderColor: theme.assistantBubbleBorder || 'transparent',
      }

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : 'message-row-bot'} ${compact ? 'message-row-compact' : ''}`}>
      {!isUser && (
        <div className="message-avatar-slot">
          {showAvatar && (
            avatarUrl ? (
              <img src={avatarUrl} alt="" className="message-avatar" />
            ) : (
              <div className="message-avatar message-avatar-fallback">C</div>
            )
          )}
        </div>
      )}
      <div
        className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-bot'}`}
        style={bubbleStyle}
      >
        <span className="message-text">{message.content}</span>
        <span className="message-time">
          {formatTime(message.timestamp)}
          {isUser && <span className="message-check">{"\u2713\u2713"}</span>}
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
