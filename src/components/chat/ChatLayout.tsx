'use client'

import { ReactNode } from 'react'
import { ThemeConfig } from '@/types'

interface ChatLayoutProps {
  theme: ThemeConfig
  template: string
  children: ReactNode
  header: ReactNode
  inputBar: ReactNode
  customCss?: string | null
}

export function ChatLayout({ theme, template, children, header, inputBar, customCss }: ChatLayoutProps) {
  const backgroundPattern = theme.backgroundPattern && theme.backgroundPattern !== 'none'
    ? theme.backgroundPattern
    : undefined

  return (
    <div
      className={`chat-page-wrapper chat-template-${template}`}
      style={{
        background: theme.background || '#EFEAE2',
        backgroundImage: backgroundPattern,
        fontFamily: theme.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {customCss && <style>{customCss}</style>}
      <div className="chat-shell">
        {header}
        <main className="chat-scroll-area">
          <div className="chat-message-list">
            {children}
          </div>
        </main>
        {inputBar}
      </div>
    </div>
  )
}
