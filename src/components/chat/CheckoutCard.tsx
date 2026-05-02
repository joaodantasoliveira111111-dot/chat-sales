'use client'

import { useState } from 'react'
import { ThemeConfig, PublicPage } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CheckoutCardProps {
  config: Record<string, unknown>
  theme: ThemeConfig
  page: PublicPage
  variables: Record<string, unknown>
  onSubmit: (data: { name: string; email: string; whatsapp?: string }) => void
}

export function CheckoutCard({ config, theme, page, variables, onSubmit }: CheckoutCardProps) {
  const [name, setName] = useState(String(variables.name || variables.customer_name || ''))
  const [email, setEmail] = useState(String(variables.email || variables.customer_email || ''))
  const [whatsapp, setWhatsapp] = useState(String(variables.whatsapp || variables.customer_whatsapp || ''))
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    setSubmitted(true)
    onSubmit({ name, email, whatsapp: whatsapp || undefined })
  }

  if (submitted) {
    return (
      <div className="animate-fade-in p-4 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
        <p className="text-sm" style={{ color: theme.assistantText }}>✓ Dados confirmados!</p>
      </div>
    )
  }

  const summaryTitle = String(config.summary_title || 'Confirme seus dados')
  const summaryText = String(config.summary_text || '')
  const buttonText = String(config.button_text || 'Continuar')

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    color: theme.inputText,
    fontSize: '14px',
    outline: 'none',
    marginTop: '4px',
  }

  return (
    <div className="animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
      <p className="text-sm font-bold mb-1" style={{ color: theme.assistantText }}>{summaryTitle}</p>
      {summaryText && <p className="text-xs mb-3 opacity-70" style={{ color: theme.assistantText }}>{summaryText}</p>}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-xs font-medium" style={{ color: theme.assistantText }}>Nome *</label>
          <input
            required
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: theme.assistantText }}>E-mail *</label>
          <input
            required
            type="email"
            style={inputStyle}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color: theme.assistantText }}>WhatsApp</label>
          <input
            type="tel"
            style={inputStyle}
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 text-sm font-semibold mt-2 transition-all active:scale-[0.98]"
          style={{
            background: theme.button,
            color: theme.buttonText,
            borderRadius: '12px',
          }}
        >
          {buttonText}
        </button>
      </form>
    </div>
  )
}
