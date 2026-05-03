'use client'

import { ChatMessage, ThemeConfig } from '@/types'

interface MediaMessageBubbleProps {
  message: ChatMessage
  theme: ThemeConfig
  avatarUrl?: string | null
  showAvatar?: boolean
  compact?: boolean
}

export function MediaMessageBubble({
  message,
  theme,
  avatarUrl,
  showAvatar = true,
  compact = false,
}: MediaMessageBubbleProps) {
  const payload = message.payload || {}
  const mediaType = String(payload.media_type || payload.type || 'image')
  const url = String(payload.media_url || payload.url || '')
  const caption = message.content || String(payload.caption || '')
  const fileName = String(payload.file_name || 'Arquivo')

  return (
    <div className={`message-row message-row-bot ${compact ? 'message-row-compact' : ''}`}>
      <div className="message-avatar-slot">
        {showAvatar && (
          avatarUrl ? (
            <img src={avatarUrl} alt="" className="message-avatar" />
          ) : (
            <div className="message-avatar message-avatar-fallback">C</div>
          )
        )}
      </div>
      <div
        className="message-bubble message-bubble-bot media-message-bubble"
        style={{
          background: theme.assistantBubble || '#FFFFFF',
          color: theme.assistantText || '#111B21',
          borderColor: theme.assistantBubbleBorder || 'transparent',
        }}
      >
        {renderMedia(mediaType, url, fileName, String(payload.thumbnail_url || ''))}
        {caption && <span className="message-text media-message-caption">{caption}</span>}
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  )
}

function renderMedia(type: string, url: string, fileName: string, thumbnailUrl: string) {
  if (!url) {
    return <div className="media-empty-state">Midia ainda nao configurada</div>
  }

  if (type === 'image') {
    return <img src={url} alt={fileName} className="chat-media-image" loading="lazy" />
  }

  if (type === 'video') {
    return <video src={url} poster={thumbnailUrl || undefined} controls playsInline className="chat-media-video" />
  }

  if (type === 'audio') {
    return <audio src={url} controls className="chat-media-audio" />
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="chat-media-document">
      <span className="chat-media-document-icon">PDF</span>
      <span>
        <strong>{fileName}</strong>
        <small>Abrir material</small>
      </span>
    </a>
  )
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
