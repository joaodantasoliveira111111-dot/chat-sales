'use client'

import { useState, useEffect } from 'react'
import { ThemeConfig, DeliveryPayload } from '@/types'
import { copyToClipboard, interpolateTemplate } from '@/lib/utils'

interface DeliveryCardProps {
  config: Record<string, unknown>
  theme: ThemeConfig
  orderId: string | null
  sessionId: string
  onFetchDelivery: () => Promise<DeliveryPayload | null>
  existingPayload: DeliveryPayload | null
}

export function DeliveryCard({
  config,
  theme,
  orderId,
  onFetchDelivery,
  existingPayload,
}: DeliveryCardProps) {
  const [payload, setPayload] = useState<DeliveryPayload | null>(existingPayload)
  const [loading, setLoading] = useState(!existingPayload)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (existingPayload) {
      setPayload(existingPayload)
      setLoading(false)
      return
    }
    if (!orderId) {
      setError('Pedido não encontrado')
      setLoading(false)
      return
    }
    onFetchDelivery().then(data => {
      if (data) setPayload(data)
      else setError('Entrega não disponível ainda')
      setLoading(false)
    })
  }, [orderId, existingPayload, onFetchDelivery])

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const template = String(config.delivery_template || '')
  const displayText = payload?.rendered_message || (payload && template ? interpolateTemplate(template, payload) : null)

  if (loading) {
    return (
      <div className="chat-inline-card animate-fade-in p-5 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="typing-dot" style={{ color: theme.typingDot, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <p className="text-xs mt-2 opacity-60" style={{ color: theme.assistantText }}>Buscando sua entrega...</p>
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="chat-inline-card animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
        <p className="text-sm" style={{ color: theme.assistantText }}>{error || 'Entrega não disponível'}</p>
      </div>
    )
  }

  return (
    <div className="chat-inline-card animate-fade-in space-y-3 min-w-0">
      {displayText && (
        <div className="p-4 rounded-2xl whitespace-pre-wrap text-sm" style={{ background: theme.assistantBubble, color: theme.assistantText }}>
          {displayText}
        </div>
      )}

      <div className="p-4 rounded-2xl space-y-3 min-w-0" style={{ background: theme.assistantBubble }}>
        <p className="text-sm font-bold" style={{ color: theme.assistantText }}>{"\u2728"} Seu acesso está pronto!</p>

        {payload.access_email && (
          <DeliveryField label="Login / e-mail" value={payload.access_email} onCopy={() => handleCopy(payload.access_email!, 'email')} copied={copied === 'email'} theme={theme} />
        )}

        {payload.access_password && (
          <DeliveryField label="Senha" value={payload.access_password} onCopy={() => handleCopy(payload.access_password!, 'password')} copied={copied === 'password'} theme={theme} isPassword />
        )}

        {payload.license_key && (
          <DeliveryField label="Chave de licença" value={payload.license_key} onCopy={() => handleCopy(payload.license_key!, 'key')} copied={copied === 'key'} theme={theme} mono />
        )}

        {payload.access_url && !payload.button_url && (
          <DeliveryField label="Link de acesso" value={payload.access_url} onCopy={() => handleCopy(payload.access_url!, 'url')} copied={copied === 'url'} theme={theme} isLink />
        )}

        {payload.button_url && payload.button_text && (
          <a
            href={payload.button_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-auto max-w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all"
            style={{ background: theme.button, color: theme.buttonText }}
          >
            {payload.button_text}
          </a>
        )}

        {payload.custom_content && (
          <div>
            <p className="text-xs opacity-60 mb-1" style={{ color: theme.assistantText }}>Conteúdo</p>
            <div className="text-sm whitespace-pre-wrap" style={{ color: theme.assistantText }}>
              {payload.custom_content}
            </div>
          </div>
        )}

        {payload.extra_instructions && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs opacity-60 mb-1" style={{ color: theme.assistantText }}>Instruções</p>
            <p className="text-xs whitespace-pre-wrap opacity-80" style={{ color: theme.assistantText }}>
              {payload.extra_instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DeliveryField({
  label, value, onCopy, copied, theme, isPassword, isLink, mono
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
  theme: ThemeConfig
  isPassword?: boolean
  isLink?: boolean
  mono?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      <p className="text-xs opacity-60 mb-1" style={{ color: theme.assistantText }}>{label}</p>
      <div className="flex items-center gap-2 min-w-0">
        <code
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg break-all"
          style={{
            background: 'rgba(0,0,0,0.2)',
            color: theme.assistantText,
            fontFamily: mono ? 'monospace' : 'inherit',
          }}
        >
          {isPassword && !showPassword ? '••••••••' : value}
        </code>
        {isPassword && (
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs px-2 py-2 rounded-lg opacity-70 hover:opacity-100"
            style={{ color: theme.assistantText, background: 'rgba(0,0,0,0.2)' }}
          >
            {showPassword ? 'Ocultar' : 'Ver'}
          </button>
        )}
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-2 rounded-lg font-semibold transition-all"
            style={{ background: theme.button, color: theme.buttonText }}
          >
            Acessar
          </a>
        ) : (
          <button
            onClick={onCopy}
            className="text-xs px-3 py-2 rounded-lg font-semibold transition-all"
            style={{ background: copied ? '#10B981' : theme.button, color: theme.buttonText }}
          >
            {copied ? '\u2713' : 'Copiar'}
          </button>
        )}
      </div>
    </div>
  )
}
