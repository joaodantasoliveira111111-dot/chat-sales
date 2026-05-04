'use client'

import { PublicPage } from '@/types'
import { ArrowLeft, Info, Phone, Video } from 'lucide-react'

interface InstagramHeaderProps {
  page: PublicPage
}

export function InstagramHeader({ page }: InstagramHeaderProps) {
  const profileName = page.public_title || 'Atendimento'
  const username = `@${slugHandle(page.slug || profileName)}`

  return (
    <header className="instagram-header">
      <button className="instagram-header-icon" aria-label="Voltar" type="button">
        <ArrowLeft size={21} />
      </button>

      {page.avatar_url ? (
        <img src={page.avatar_url} alt="" className="instagram-header-avatar" />
      ) : (
        <div className="instagram-header-avatar instagram-header-avatar-fallback">
          {profileName.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="instagram-header-info">
        <p className="instagram-header-name">{profileName}</p>
        <p className="instagram-header-username">{username}</p>
      </div>

      <div className="instagram-header-actions">
        <button className="instagram-header-icon" aria-label="Ligação" type="button">
          <Phone size={19} />
        </button>
        <button className="instagram-header-icon" aria-label="Vídeo" type="button">
          <Video size={20} />
        </button>
        <button className="instagram-header-icon" aria-label="Informações" type="button">
          <Info size={20} />
        </button>
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
