'use client'

import { ReactNode } from 'react'

interface WhatsAppLayoutProps {
  children: ReactNode
  header: ReactNode
  inputBar: ReactNode
  customCss?: string | null
}

export function WhatsAppLayout({ children, header, inputBar, customCss }: WhatsAppLayoutProps) {
  return (
    <div className="whatsapp-chat-page">
      {customCss && <style>{customCss}</style>}
      <div className="whatsapp-chat-shell">
        {header}
        <main className="whatsapp-chat-messages">
          <div className="whatsapp-message-list">{children}</div>
        </main>
        {inputBar}
      </div>
    </div>
  )
}
