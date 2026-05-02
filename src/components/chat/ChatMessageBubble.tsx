'use client'

import { ChatMessage, ThemeConfig } from '@/types'

interface ChatMessageBubbleProps {
  message: ChatMessage
  theme: ThemeConfig
  avatarUrl?: string | null
  isUser: boolean
}

export function ChatMessageBubble({ message, theme, avatarUrl, isUser }: ChatMessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden mb-1">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full gradient-primary flex items-center justify-center text-xs text-white font-bold">
              C
            </div>
          )}
        </div>
      )}
      <div
        className="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
        style={{
          background: isUser ? theme.userBubble : theme.assistantBubble,
          color: isUser ? theme.userText : theme.assistantText,
          borderRadius: theme.bubbleRadius || '16px',
          border: !isUser && theme.assistantBubbleBorder ? `1px solid ${theme.assistantBubbleBorder}` : undefined,
          boxShadow: !isUser && theme.assistantBubbleShadow ? theme.assistantBubbleShadow : theme.shadow,
        }}
      >
        {message.content}
      </div>
    </div>
  )
}
