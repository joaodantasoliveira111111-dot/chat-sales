'use client'

import { ChatMessage } from '@/types'

interface InstagramMediaMessageProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function InstagramMediaMessage({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: InstagramMediaMessageProps) {
  const payload = message.payload as any
  const mediaType = payload?.media_type || 'image'
  const mediaUrl = payload?.media_url
  const caption = message.content || payload?.caption
  const time = formatTime(message.timestamp)

  if (!mediaUrl) return null

  return (
    <div className={`instagram-message-row ${isUser ? 'instagram-message-row-user' : 'instagram-message-row-bot'} ${compact ? 'instagram-message-row-compact' : ''}`}>
      {!isUser && (
        <div className="instagram-message-avatar-slot">
          {showAvatar && (
            avatarUrl ? (
              <img src={avatarUrl} alt="" className="instagram-message-avatar" />
            ) : (
              <div className="instagram-message-avatar instagram-message-avatar-fallback">C</div>
            )
          )}
        </div>
      )}
      <div className={`instagram-message-bubble ${isUser ? 'instagram-message-bubble-user' : 'instagram-message-bubble-bot'} instagram-message-bubble-media`}>
        {mediaType === 'image' && (
          <img src={mediaUrl} alt="" className="instagram-media-image" />
        )}
        {mediaType === 'video' && (
          <video src={mediaUrl} controls className="instagram-media-video" />
        )}
        {mediaType === 'audio' && (
          <audio src={mediaUrl} controls className="instagram-media-audio" />
        )}
        {mediaType === 'file' && (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="instagram-media-file">
            <span style={{ marginRight: 4 }}>&#128206;</span>{payload?.file_name || 'Arquivo'}
          </a>
        )}
        {caption && <span className="instagram-message-text">{caption}</span>}
        <span className="instagram-message-time">{time}</span>
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
