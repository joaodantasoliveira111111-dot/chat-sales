'use client'

import { FlowButton, ThemeConfig } from '@/types'

interface ChatButtonProps {
  button: FlowButton
  theme: ThemeConfig
  onClick: () => void
}

export function ChatButton({ button, theme, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-sm font-medium text-left transition-all duration-200 animate-fade-in active:scale-[0.98]"
      style={{
        background: theme.button,
        color: theme.buttonText,
        borderRadius: '12px',
      }}
      onMouseEnter={e => {
        if (theme.buttonHover) {
          (e.currentTarget as HTMLElement).style.background = theme.buttonHover
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = theme.button
      }}
    >
      {button.label}
    </button>
  )
}
