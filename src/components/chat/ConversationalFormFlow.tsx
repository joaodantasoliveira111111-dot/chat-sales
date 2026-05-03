'use client'

import { useMemo, useState } from 'react'
import { PublicPage, ThemeConfig } from '@/types'

interface ConversationalFormFlowProps {
  config: Record<string, unknown>
  theme: ThemeConfig
  page: PublicPage
  variables: Record<string, unknown>
  onSubmit: (data: { name: string; email: string; whatsapp?: string }) => void
}

type FieldKey = 'name' | 'email' | 'whatsapp'

const fields: Array<{ key: FieldKey; question: string; placeholder: string; type: string; required?: boolean }> = [
  { key: 'name', question: 'Qual seu nome completo?', placeholder: 'Seu nome completo', type: 'text', required: true },
  { key: 'email', question: 'Qual seu e-mail?', placeholder: 'seu@email.com', type: 'email', required: true },
  { key: 'whatsapp', question: 'Qual seu WhatsApp?', placeholder: '(11) 99999-9999', type: 'tel' },
]

export function ConversationalFormFlow({ config, theme, page, variables, onSubmit }: ConversationalFormFlowProps) {
  const initialAnswers = useMemo(() => ({
    name: String(variables.name || variables.customer_name || ''),
    email: String(variables.email || variables.customer_email || ''),
    whatsapp: String(variables.whatsapp || variables.customer_whatsapp || ''),
  }), [variables])

  const [answers, setAnswers] = useState<Record<FieldKey, string>>(initialAnswers)
  const [step, setStep] = useState<FieldKey>(() => {
    if (!initialAnswers.name) return 'name'
    if (!initialAnswers.email) return 'email'
    return 'whatsapp'
  })
  const [input, setInput] = useState(initialAnswers[step])
  const [submitted, setSubmitted] = useState(false)

  const visibleFields = fields.slice(0, fields.findIndex(field => field.key === step) + 1)
  const currentField = fields.find(field => field.key === step) || fields[0]
  const buttonText = String(config.button_text || 'Continuar para pagamento')

  const submitStep = () => {
    const value = input.trim()
    if (currentField.required && !value) return

    const nextAnswers = { ...answers, [currentField.key]: value }
    setAnswers(nextAnswers)

    const nextIndex = fields.findIndex(field => field.key === currentField.key) + 1
    const nextField = fields[nextIndex]

    if (nextField) {
      setStep(nextField.key)
      setInput(nextAnswers[nextField.key] || '')
      return
    }

    setSubmitted(true)
    onSubmit({
      name: nextAnswers.name,
      email: nextAnswers.email,
      whatsapp: nextAnswers.whatsapp || undefined,
    })
  }

  return (
    <div className="conversation-form-flow">
      {visibleFields.map(field => (
        <div key={field.key} className="conversation-form-step">
          <div className="message-row message-row-bot">
            <div className="message-avatar-slot">
              {page.avatar_url ? (
                <img src={page.avatar_url} alt="" className="message-avatar" />
              ) : (
                <div className="message-avatar message-avatar-fallback">C</div>
              )}
            </div>
            <div
              className="message-bubble message-bubble-bot"
              style={{ background: theme.assistantBubble || '#fff', color: theme.assistantText || '#111B21' }}
            >
              <span className="message-text">{field.question}</span>
              <span className="message-time">{formatTime(Date.now())}</span>
            </div>
          </div>

          {answers[field.key] && (
            <div className="message-row message-row-user">
              <div
                className="message-bubble message-bubble-user"
                style={{ background: theme.userBubble || '#D9FDD3', color: theme.userText || '#111B21' }}
              >
                <span className="message-text">{answers[field.key]}</span>
                <span className="message-time">{formatTime(Date.now())}<span className="message-check">{"\u2713\u2713"}</span></span>
              </div>
            </div>
          )}
        </div>
      ))}

      {!submitted && !answers[currentField.key] && (
        <div className="conversation-form-card">
          <input
            type={currentField.type}
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') submitStep()
            }}
            placeholder={currentField.placeholder}
            className="conversation-form-input"
            autoFocus
          />
          <button type="button" className="conversation-form-action" onClick={submitStep}>
            {currentField.key === 'whatsapp' ? buttonText : 'Responder'}
          </button>
        </div>
      )}
    </div>
  )
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
