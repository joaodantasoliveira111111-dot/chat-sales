'use client'

import { PublicPage, ThemeConfig } from '@/types'
import { ArrowLeft, Info, MoreVertical, Phone, Video } from 'lucide-react'

interface ChatHeaderProps {
  page: PublicPage
  theme: ThemeConfig
  template: string
}

export function ChatHeader({ page, theme, template }: ChatHeaderProps) {
  const profileName = page.public_title || 'Atendimento'
  const subtitle = template === 'instagram'
    ? `@${slugHandle(page.slug || profileName)}`
    : page.public_subtitle || 'online'
  const isInstagram = template === 'instagram'

  return (
    <header
      className="chat-native-header"
      style={{
        background: isInstagram ? '#FFFFFF' : theme.headerBg || '#008069',
        color: isInstagram ? '#262626' : theme.headerText || '#fff',
        borderColor: isInstagram ? '#DBDBDB' : 'rgba(17, 27, 33, 0.08)',
      }}
    >
      <button className="chat-header-icon" aria-label="Voltar" type="button">
        <ArrowLeft size={21} />
      </button>

      {page.avatar_url ? (
        <img src={page.avatar_url} alt="" className="chat-header-avatar" />
      ) : (
        <div className="chat-header-avatar chat-header-avatar-fallback">
          {profileName.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="chat-header-copy">
        <p className="chat-header-title">{profileName}</p>
        <p className="chat-header-subtitle">{subtitle}</p>
      </div>

      <div className="chat-header-actions">
        <button className="chat-header-icon" aria-label="Ligação" type="button"><Phone size={19} /></button>
        {template === 'instagram' && (
          <button className="chat-header-icon" aria-label="Vídeo" type="button"><Video size={20} /></button>
        )}
        <button className="chat-header-icon" aria-label="Informações" type="button">{isInstagram ? <Info size={20} /> : <MoreVertical size={20} />}</button>
      </div>
    </header>
  )
}

function slugHandle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_.]+/g, '')
    .slice(0, 24) || 'chatfy'
}

