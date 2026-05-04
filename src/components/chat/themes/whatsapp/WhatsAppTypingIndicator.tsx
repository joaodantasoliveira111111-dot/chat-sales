'use client'

interface WhatsAppTypingIndicatorProps {
  avatarUrl?: string | null
}

export function WhatsAppTypingIndicator({ avatarUrl }: WhatsAppTypingIndicatorProps) {
  return (
    <div className="whatsapp-message-row whatsapp-message-row-bot">
      <div className="whatsapp-message-avatar-slot">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="whatsapp-message-avatar" />
        ) : (
          <div className="whatsapp-message-avatar whatsapp-message-avatar-fallback">C</div>
        )}
      </div>
      <div className="whatsapp-typing-bubble">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="whatsapp-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
