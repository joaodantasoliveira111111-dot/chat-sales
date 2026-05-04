'use client'

import { ChatMessage } from '@/types'

interface WhatsAppMediaMessageProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function WhatsAppMediaMessage({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: WhatsAppMediaMessageProps) {
  const payload = message.payload as any
  const mediaType = payload?.media_type || 'image'
  const mediaUrl = payload?.media_url
  const caption = message.content || payload?.caption
  const time = formatTime(message.timestamp)

  if (!mediaUrl) return null

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
      <div className={`whatsapp-message-bubble ${isUser ? 'whatsapp-message-bubble-user' : 'whatsapp-message-bubble-bot'} whatsapp-message-bubble-media`}>
        {mediaType === 'image' && (
          <img src={mediaUrl} alt="" className="whatsapp-media-image" />
        )}
        {mediaType === 'video' && (
          <video src={mediaUrl} controls className="whatsapp-media-video" />
        )}
        {mediaType === 'audio' && (
          <audio src={mediaUrl} controls className="whatsapp-media-audio" />
        )}
        {mediaType === 'file' && (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-media-file">
            📎 {payload?.file_name || 'Arquivo'}
          </a>
        )}
        {caption && <span className="whatsapp-message-text">{caption}</span>}
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
