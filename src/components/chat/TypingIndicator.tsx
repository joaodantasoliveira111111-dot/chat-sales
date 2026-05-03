'use client'

import { ThemeConfig } from '@/types'

interface TypingIndicatorProps {
  theme: ThemeConfig
  avatarUrl?: string | null
}

export function TypingIndicator({ theme, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="message-row message-row-bot animate-fade-in">
      <div className="message-avatar-slot">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="message-avatar" />
        ) : (
          <div className="message-avatar message-avatar-fallback">C</div>
        )}
      </div>
      <div
        className="typing-bubble"
        style={{
          background: theme.assistantBubble || '#fff',
          borderColor: theme.assistantBubbleBorder || 'transparent',
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="typing-dot"
            style={{ color: theme.typingDot || '#8B5CF6', animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
