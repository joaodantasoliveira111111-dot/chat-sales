'use client'

interface PremiumProductChatTypingIndicatorProps {
  avatarUrl?: string | null
}

export function PremiumProductChatTypingIndicator({ avatarUrl }: PremiumProductChatTypingIndicatorProps) {
  return (
    <div className="ppc-message-row ppc-message-row-bot">
      <div className="ppc-avatar-slot">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="ppc-avatar" />
        ) : (
          <div className="ppc-avatar ppc-avatar-fallback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
        )}
      </div>
      <div className="ppc-typing-bubble">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="ppc-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
