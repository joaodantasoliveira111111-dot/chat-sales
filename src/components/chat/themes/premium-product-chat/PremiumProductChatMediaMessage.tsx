'use client'

import { ChatMessage } from '@/types'

interface PremiumProductChatMediaMessageProps {
  message: ChatMessage
  isUser: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function PremiumProductChatMediaMessage({
  message,
  isUser,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: PremiumProductChatMediaMessageProps) {
  const payload = message.payload as any
  const mediaType = payload?.media_type || 'image'
  const mediaUrl = payload?.media_url
  const caption = message.content || payload?.caption
  const time = formatTime(message.timestamp)

  if (!mediaUrl) return null

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
      <div className={`ppc-message-bubble ${isUser ? 'ppc-message-bubble-user' : 'ppc-message-bubble-bot'} ppc-message-bubble-media`}>
        {mediaType === 'image' && <img src={mediaUrl} alt="" className="ppc-media-image" />}
        {mediaType === 'video' && <video src={mediaUrl} controls className="ppc-media-video" />}
        {mediaType === 'audio' && <audio src={mediaUrl} controls className="ppc-media-audio" />}
        {mediaType === 'file' && (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="ppc-media-file">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            {payload?.file_name || 'Arquivo'}
          </a>
        )}
        {caption && <span className="ppc-message-text">{caption}</span>}
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
