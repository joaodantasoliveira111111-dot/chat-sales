'use client'

interface InstagramTypingIndicatorProps {
  avatarUrl?: string | null
}

export function InstagramTypingIndicator({ avatarUrl }: InstagramTypingIndicatorProps) {
  return (
    <div className="instagram-message-row instagram-message-row-bot">
      <div className="instagram-message-avatar-slot">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="instagram-message-avatar" />
        ) : (
          <div className="instagram-message-avatar instagram-message-avatar-fallback">C</div>
        )}
      </div>
      <div className="instagram-typing-bubble">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="instagram-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
