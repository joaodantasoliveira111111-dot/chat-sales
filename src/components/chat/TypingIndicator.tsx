'use client'

import { ThemeConfig } from '@/types'

interface TypingIndicatorProps {
  theme: ThemeConfig
  avatarUrl?: string | null
}

export function TypingIndicator({ theme, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full flex-shrink-0 mb-1 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center text-xs text-white font-bold">C</div>
        )}
      </div>
      <div
        className="px-4 py-3 flex items-center gap-1.5"
        style={{
          background: theme.assistantBubble,
          borderRadius: theme.bubbleRadius || '16px',
          border: theme.assistantBubbleBorder ? `1px solid ${theme.assistantBubbleBorder}` : undefined,
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
