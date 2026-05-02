'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeConfig, PublicPage } from '@/types'
import { copyToClipboard, formatCurrency, sleep } from '@/lib/utils'
import Image from 'next/image'

interface PixPaymentCardProps {
  config: Record<string, unknown>
  theme: ThemeConfig
  page: PublicPage
  variables: Record<string, unknown>
  orderId: string | null
  sessionId: string
  onPaymentSuccess: (orderId: string) => void
}

export function PixPaymentCard({
  config,
  theme,
  page,
  variables,
  orderId: initialOrderId,
  sessionId,
  onPaymentSuccess,
}: PixPaymentCardProps) {
  const [orderId, setOrderId] = useState<string | null>(initialOrderId)
  const [pixCode, setPixCode] = useState<string | null>(null)
  const [pixQrUrl, setPixQrUrl] = useState<string | null>(null)
  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [error, setError] = useState<string | null>(null)

  // Create order if needed
  useEffect(() => {
    if (orderId) {
      // Fetch existing order data
      fetch(`/api/orders/${orderId}/status?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          setStatus(data.status === 'paid' || data.status === 'delivered' ? 'paid' : 'pending')
          setAmount(data.amount)
          setLoading(false)
        })
        .catch(() => setLoading(false))
      return
    }

    // Create new order
    const createOrder = async () => {
      try {
        const productId = page.product_id || String(config.product_id || '')
        if (!productId) {
          setError('Produto não configurado')
          setLoading(false)
          return
        }

        const res = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            page_id: page.id,
            session_id: sessionId,
            customer_name: String(variables.name || variables.customer_name || 'Cliente'),
            customer_email: String(variables.email || variables.customer_email || ''),
            customer_whatsapp: String(variables.whatsapp || variables.customer_whatsapp || ''),
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          setError(err.error || 'Erro ao gerar PIX')
          setLoading(false)
          return
        }

        const data = await res.json()
        setOrderId(data.order_id)
        setPixCode(data.pix_code)
        setPixQrUrl(data.pix_qr_code_url)
        setPixQrBase64(data.pix_qr_code_base64)
        setAmount(data.amount)
        setLoading(false)
      } catch {
        setError('Erro ao gerar PIX. Tente novamente.')
        setLoading(false)
      }
    }

    createOrder()
  }, [])

  // Poll payment status
  const pollStatus = useCallback(async () => {
    if (!orderId || status === 'paid') return

    try {
      const res = await fetch(`/api/orders/${orderId}/status?session_id=${sessionId}`)
      const data = await res.json()

      if (data.status === 'paid' || data.status === 'delivered') {
        setStatus('paid')
        onPaymentSuccess(orderId)
      } else if (data.status === 'expired') {
        setStatus('expired')
      }
    } catch {}
  }, [orderId, status, sessionId, onPaymentSuccess])

  useEffect(() => {
    if (!orderId || status !== 'pending') return
    const interval = setInterval(pollStatus, 5000)
    return () => clearInterval(interval)
  }, [orderId, status, pollStatus])

  const handleCopy = async () => {
    if (!pixCode) return
    await copyToClipboard(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const qrImageSrc = pixQrBase64 || pixQrUrl

  if (loading) {
    return (
      <div className="animate-fade-in p-6 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="typing-dot" style={{ color: theme.typingDot, animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <p className="text-xs mt-2 opacity-60" style={{ color: theme.assistantText }}>Gerando PIX...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div className="animate-fade-in p-5 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm font-bold" style={{ color: theme.assistantText }}>Pagamento confirmado!</p>
        <p className="text-xs opacity-70 mt-1" style={{ color: theme.assistantText }}>Aguarde enquanto preparamos sua entrega...</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
        <p className="text-sm" style={{ color: theme.assistantText }}>⏰ PIX expirado. Solicite um novo.</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in p-4 rounded-2xl space-y-4" style={{ background: theme.assistantBubble }}>
      <div className="text-center">
        <p className="text-sm font-bold mb-1" style={{ color: theme.assistantText }}>
          Pague via PIX
        </p>
        {amount && (
          <p className="text-2xl font-black" style={{ color: theme.assistantText }}>
            {formatCurrency(amount)}
          </p>
        )}
        <p className="text-xs opacity-60 mt-1" style={{ color: theme.assistantText }}>
          {String(config.pending_text || 'Escaneie o QR Code ou copie o código abaixo')}
        </p>
      </div>

      {/* QR Code */}
      {qrImageSrc && (
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-xl">
            <img
              src={qrImageSrc}
              alt="QR Code PIX"
              width={180}
              height={180}
              className="block"
            />
          </div>
        </div>
      )}

      {/* PIX Code */}
      {pixCode && (
        <div className="space-y-2">
          <div
            className="text-xs p-3 rounded-lg break-all"
            style={{ background: 'rgba(0,0,0,0.2)', color: theme.assistantText, opacity: 0.8 }}
          >
            {pixCode.slice(0, 60)}...
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-3 text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: copied ? '#10B981' : theme.button,
              color: theme.buttonText,
              borderRadius: '12px',
            }}
          >
            {copied ? '✓ Código copiado!' : String(config.copy_button_text || '📋 Copiar código PIX')}
          </button>
        </div>
      )}

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <p className="text-xs opacity-60" style={{ color: theme.assistantText }}>
            Aguardando confirmação de pagamento...
          </p>
        </div>
      </div>
    </div>
  )
}
