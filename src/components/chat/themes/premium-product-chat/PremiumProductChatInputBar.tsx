'use client'

import { Send, Paperclip } from 'lucide-react'

interface PremiumProductChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  active?: boolean
  type?: string
  placeholder?: string
}

export function PremiumProductChatInputBar({
  value,
  onChange,
  onSend,
  active = false,
  type = 'text',
  placeholder = 'Digite sua mensagem...',
}: PremiumProductChatInputBarProps) {
  return (
    <footer className="ppc-input-area">
      <div className="ppc-input-bar">
        <div className="ppc-input-attachment">
          <Paperclip size={20} />
        </div>
        <input
          type={type}
          value={value}
          disabled={!active}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend() }}
          placeholder={placeholder}
          className="ppc-input"
        />
        <button
          type="button"
          className="ppc-send-button"
          onClick={onSend}
          disabled={!active || !value.trim()}
          aria-label="Enviar mensagem"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="ppc-input-security">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span>Transação 100% segura</span>
      </div>
    </footer>
  )
}
