'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface WhatsAppPaymentCardProps {
  config: {
    amount?: number
    pix_code?: string
    qr_code?: string
    copy_button_text?: string
  }
  onCopy?: () => void
}

export function WhatsAppPaymentCard({ config, onCopy }: WhatsAppPaymentCardProps) {
  const [copied, setCopied] = useState(false)
  const amount = config.amount || 0
  const pixCode = config.pix_code
  const qrCode = config.qr_code
  const copyButtonText = config.copy_button_text || 'Copiar código Pix'

  const handleCopy = async () => {
    if (!pixCode) return
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy?.()
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="whatsapp-payment-card">
      <div className="whatsapp-payment-header">
        <p className="whatsapp-payment-title">Pague via Pix</p>
        {amount > 0 && (
          <p className="whatsapp-payment-amount">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(amount)}
          </p>
        )}
      </div>

      {qrCode && (
        <div className="whatsapp-payment-qr">
          <img src={qrCode} alt="QR Code Pix" />
        </div>
      )}

      {pixCode && (
        <div className="whatsapp-payment-code">
          <p className="whatsapp-payment-code-label">Código Pix:</p>
          <p className="whatsapp-payment-code-value">{pixCode}</p>
        </div>
      )}

      {pixCode && (
        <button
          type="button"
          className="whatsapp-payment-copy-button"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={16} />
              Copiado!
            </>
          ) : (
            <>
              <Copy size={16} />
              {copyButtonText}
            </>
          )}
        </button>
      )}
    </div>
  )
}
