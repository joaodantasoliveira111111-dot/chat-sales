'use client'

import { Send } from 'lucide-react'

interface WhatsAppInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  active?: boolean
  type?: string
  placeholder?: string
}

export function WhatsAppInputBar({
  value,
  onChange,
  onSend,
  active = false,
  type = 'text',
  placeholder = 'Digite uma mensagem',
}: WhatsAppInputBarProps) {
  return (
    <footer className="whatsapp-input-bar">
      <div className="whatsapp-input-inner">
        <input
          type={type}
          value={value}
          disabled={!active}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSend()
          }}
          placeholder={placeholder}
          className="whatsapp-input"
        />
        <button
          type="button"
          className="whatsapp-send-button"
          onClick={onSend}
          disabled={!active || !value.trim()}
          aria-label="Enviar mensagem"
        >
          <Send size={18} />
        </button>
      </div>
    </footer>
  )
}
