'use client'

import { ArrowUp, Camera, Image, Mic } from 'lucide-react'

interface InstagramInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  active?: boolean
  type?: string
  placeholder?: string
}

export function InstagramInputBar({
  value,
  onChange,
  onSend,
  active = false,
  type = 'text',
  placeholder = 'Mensagem...',
}: InstagramInputBarProps) {
  return (
    <footer className="instagram-input-bar">
      <div className="instagram-input-inner">
        <button type="button" className="instagram-input-tool" aria-label="Câmera">
          <Camera size={19} />
        </button>
        <input
          type={type}
          value={value}
          disabled={!active}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onSend()
          }}
          placeholder={placeholder}
          className="instagram-input"
        />
        <button type="button" className="instagram-input-tool" aria-label="Áudio">
          <Mic size={19} />
        </button>
        <button type="button" className="instagram-input-tool" aria-label="Imagem">
          <Image size={19} />
        </button>
        <button
          type="button"
          className="instagram-send-button"
          onClick={onSend}
          disabled={!active || !value.trim()}
          aria-label="Enviar mensagem"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </footer>
  )
}
