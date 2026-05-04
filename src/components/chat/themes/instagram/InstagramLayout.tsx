'use client'

import { ReactNode } from 'react'

interface InstagramLayoutProps {
  children: ReactNode
  header: ReactNode
  inputBar: ReactNode
  customCss?: string | null
}

export function InstagramLayout({ children, header, inputBar, customCss }: InstagramLayoutProps) {
  return (
    <div className="instagram-chat-page">
      {customCss && <style>{customCss}</style>}
      <div className="instagram-chat-shell">
        {header}
        <main className="instagram-chat-messages">
          <div className="instagram-message-list">{children}</div>
        </main>
        {inputBar}
      </div>
    </div>
  )
}
