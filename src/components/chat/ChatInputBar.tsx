'use client'

import { ArrowUp, Camera, Image, Mic, Send } from 'lucide-react'

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  active?: boolean
  type?: string
  placeholder?: string
  template?: string
}

export function ChatInputBar({
  value,
  onChange,
  onSend,
  active = false,
  type = 'text',
  placeholder = 'Digite uma mensagem',
  template = 'whatsapp',
}: ChatInputBarProps) {
  const isInstagram = template === 'instagram'

  return (
    <footer className="chat-input-bar">
      <div className="chat-input-inner">
        {isInstagram && (
          <button type="button" className="chat-input-tool" aria-label="Câmera">
            <Camera size={19} />
          </button>
        )}
        <input
          type={type}
          value={value}
          disabled={!active}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') onSend()
          }}
          placeholder={isInstagram ? 'Mensagem...' : placeholder}
          className="chat-input"
        />
        {isInstagram && (
          <>
            <button type="button" className="chat-input-tool" aria-label="Áudio">
              <Mic size={19} />
            </button>
            <button type="button" className="chat-input-tool" aria-label="Imagem">
              <Image size={19} />
            </button>
          </>
        )}
        <button
          type="button"
          className="chat-send-button"
          onClick={onSend}
          disabled={!active || !value.trim()}
          aria-label="Enviar mensagem"
        >
          {isInstagram ? <ArrowUp size={18} /> : <Send size={18} />}
        </button>
      </div>
    </footer>
  )
}
