'use client'

import { PublicPage } from '@/types'
import { ArrowLeft, MoreVertical, Phone } from 'lucide-react'

interface WhatsAppHeaderProps {
  page: PublicPage
}

export function WhatsAppHeader({ page }: WhatsAppHeaderProps) {
  const profileName = page.public_title || 'Atendimento'
  const subtitle = page.public_subtitle || 'online'

  return (
    <header className="whatsapp-header">
      <button className="whatsapp-header-icon" aria-label="Voltar" type="button">
        <ArrowLeft size={21} />
      </button>

      {page.avatar_url ? (
        <img src={page.avatar_url} alt="" className="whatsapp-header-avatar" />
      ) : (
        <div className="whatsapp-header-avatar whatsapp-header-avatar-fallback">
          {profileName.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="whatsapp-header-info">
        <p className="whatsapp-header-name">{profileName}</p>
        <p className="whatsapp-header-status">{subtitle}</p>
      </div>

      <div className="whatsapp-header-actions">
        <button className="whatsapp-header-icon" aria-label="Ligação" type="button">
          <Phone size={19} />
        </button>
        <button className="whatsapp-header-icon" aria-label="Menu" type="button">
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  )
}
