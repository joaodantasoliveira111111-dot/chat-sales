'use client'

import { ReactNode } from 'react'

interface PremiumProductChatLayoutProps {
  children: ReactNode
  header: ReactNode
  inputBar: ReactNode
  customCss?: string | null
}

export function PremiumProductChatLayout({ children, header, inputBar, customCss }: PremiumProductChatLayoutProps) {
  return (
    <div className="ppc-chat-page">
      {customCss && <style>{customCss}</style>}
      <div className="ppc-chat-frame">
        {header}
        <main className="ppc-chat-messages">
          <div className="ppc-message-list">{children}</div>
        </main>
        {inputBar}
      </div>
    </div>
  )
}
