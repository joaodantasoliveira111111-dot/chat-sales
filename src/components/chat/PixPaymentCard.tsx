'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeConfig, PublicPage } from '@/types'
import { copyToClipboard, formatCurrency, renderTemplateVariables } from '@/lib/utils'
import { getMetaBrowserContext, trackMetaBrowserEvent } from '@/lib/meta/browser'
import { generateMetaEventId, toMetaEventName } from '@/lib/meta/events'

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
  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null)

  const trackPaymentEvent = useCallback((event: string, data: Record<string, unknown> = {}) => {
    const context = {
      event,
      page_id: page.id,
      product_id: page.product_id || String(config.product_id || ''),
      flow_id: page.flow_id,
      user_id: page.user_id,
      order_id: orderId || data.order_id,
      session_id: sessionId,
      ...data,
    }
    const metaEventName = toMetaEventName(event)
    const eventId = trackMetaBrowserEvent(metaEventName, context, {
      ...data,
      content_ids: page.product_id ? [page.product_id] : undefined,
      content_name: page.product?.name || page.public_title,
      value: data.amount || page.product?.price,
      currency: page.product?.currency || 'BRL',
      payment_method: 'pix',
    }) || generateMetaEventId(metaEventName, context)
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        page_id: page.id,
        product_id: page.product_id || String(config.product_id || ''),
        flow_id: page.flow_id,
        user_id: page.user_id,
        order_id: orderId || undefined,
        session_id: sessionId,
        event_id: eventId,
        source: 'both',
        ...getMetaBrowserContext(),
        ...data,
      }),
    }).catch(() => {})
  }, [page.id, page.product_id, page.flow_id, page.user_id, config.product_id, orderId, sessionId])

  // Create order if needed
  useEffect(() => {
    if (orderId) {
      // Fetch existing order data
      fetch(`/api/orders/${orderId}/status?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          setStatus(isPaidLikeStatus(data.status) ? 'paid' : 'pending')
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
        flow_id: page.flow_id || undefined,
        session_id: sessionId,
            customer_name: String(getVariable(variables, 'lead.name') || variables.name || variables.customer_name || 'Cliente'),
            customer_email: String(getVariable(variables, 'lead.email') || variables.email || variables.customer_email || ''),
            customer_whatsapp: String(getVariable(variables, 'lead.phone') || variables.whatsapp || variables.customer_whatsapp || ''),
          }),
        })

      if (!res.ok) {
        const err = await res.json()
        const fieldErrors = err.details?.fieldErrors
        const detailMsg = fieldErrors
          ? Object.entries(fieldErrors).map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`).join('; ')
          : ''
        console.error('[PixPaymentCard] payment create failed:', res.status, err, 'request body:', { productId, page_id: page.id, flow_id: page.flow_id, session_id: sessionId })
        setError(detailMsg || err.error || 'Erro ao gerar PIX')
        setLoading(false)
        return
      }

        const data = await res.json()
        setOrderId(data.order_id)
        setTrackedOrderId(data.order_id)
        setPixCode(data.pix_code)
        setPixQrUrl(data.pix_qr_code_url)
        setAmount(data.amount)
        trackPaymentEvent('InitiateCheckout', {
          order_id: data.order_id,
          amount: data.amount,
        })
        trackPaymentEvent('AddPaymentInfo', {
          order_id: data.order_id,
          amount: data.amount,
        })
        trackPaymentEvent('PaymentPending', {
          order_id: data.order_id,
          amount: data.amount,
        })
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

      if (isPaidLikeStatus(data.status)) {
        setStatus('paid')
        trackPaymentEvent('Purchase', { order_id: orderId })
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
    trackPaymentEvent('PixCopied', { order_id: orderId || trackedOrderId })
    setTimeout(() => setCopied(false), 3000)
  }

  const qrImageSrc = pixQrUrl
  const renderPaymentText = (value: unknown) => renderTemplateVariables(String(value || ''), {
    ...variables,
    product: {
      id: page.product?.id || page.product_id || config.product_id,
      name: page.product?.name || variables['product.name'] || page.public_title,
      price: page.product?.price || variables['product.price'],
    },
    order: { id: orderId, amount, status },
    payment: { status, pix_code: pixCode, qr_code: qrImageSrc },
    'order.id': orderId,
    'order.amount': amount,
    'payment.status': status,
    'payment.pix_code': pixCode,
    'payment.qr_code': qrImageSrc,
  })

  if (loading) {
    return (
      <div className="chat-inline-card pix-payment-card animate-fade-in p-6 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
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
      <div className="chat-inline-card pix-payment-card animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (status === 'paid') {
    return (
      <div className="chat-inline-card pix-payment-card animate-fade-in p-5 rounded-2xl text-center" style={{ background: theme.assistantBubble }}>
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="text-sm font-bold" style={{ color: theme.assistantText }}>Pagamento confirmado!</p>
        <p className="text-xs opacity-70 mt-1" style={{ color: theme.assistantText }}>Aguarde enquanto preparamos sua entrega...</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="chat-inline-card pix-payment-card animate-fade-in p-4 rounded-2xl" style={{ background: theme.assistantBubble }}>
        <p className="text-sm" style={{ color: theme.assistantText }}>⏰ PIX expirado. Solicite um novo.</p>
      </div>
    )
  }

  return (
    <div className="chat-inline-card pix-payment-card animate-fade-in p-4 rounded-2xl space-y-4 min-w-0" style={{ background: theme.assistantBubble }}>
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
          {renderPaymentText(config.pending_text || 'Escaneie o QR Code ou copie o código abaixo')}
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
              className="block max-w-full h-auto"
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
            {copied ? 'Código copiado!' : renderPaymentText(config.copy_button_text || 'Copiar código Pix')}
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

function isPaidLikeStatus(status: string) {
  return ['paid', 'delivered', 'manual_pending', 'paid_pending_stock', 'pending_delivery'].includes(status)
}

function getVariable(variables: Record<string, unknown>, key: string) {
  if (key in variables) return variables[key]
  return key.split('.').reduce((value: unknown, part) => {
    if (value && typeof value === 'object' && part in value) {
      return (value as Record<string, unknown>)[part]
    }
    return undefined
  }, variables)
}
