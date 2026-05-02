import { PaymentProvider } from '../paymentProvider'
import { CreatePixPaymentParams, PixPaymentResult, PaymentStatus } from '@/types'

/**
 * PushinPay Payment Provider
 * 
 * Docs: https://api.pushinpay.com.br/api
 * Auth: Bearer Token
 * 
 * POST /pix/cashIn - Create PIX payment
 * GET /transactions/{id} - Get transaction status
 * Webhook: { id, value, status, end_to_end_id }
 */
export class PushinPayProvider implements PaymentProvider {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.PUSHINPAY_API_URL || 'https://api.pushinpay.com.br/api'
    this.token = process.env.PUSHINPAY_TOKEN || ''
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult> {
    const webhookUrl = params.webhookUrl || 
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`

    const body = {
      value: Math.round(params.amount * 100), // PushinPay uses centavos
      webhook_url: webhookUrl,
      split_rules: [],
    }

    const response = await fetch(`${this.baseUrl}/pix/cashIn`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`PushinPay error: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    return {
      gatewayPaymentId: data.id,
      pixCode: data.qr_code,
      pixQrCodeBase64: data.qr_code_base64,
      expiresAt,
      status: data.status,
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(`${this.baseUrl}/transactions/${paymentId}`, {
      method: 'GET',
      headers: this.headers,
    })

    if (!response.ok) {
      return { id: paymentId, status: 'pending' }
    }

    const data = await response.json()

    // PushinPay statuses: created | paid | canceled
    let status: PaymentStatus['status'] = 'pending'
    if (data.status === 'paid') status = 'paid'
    else if (data.status === 'canceled') status = 'cancelled'

    return { id: paymentId, status, raw: data }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ) {
    // PushinPay webhook: { id, value, status, end_to_end_id }
    const status = payload.status as string
    const gatewayPaymentId = payload.id as string

    if (status === 'paid') {
      return { status: 'paid' as const, gatewayPaymentId }
    }
    if (status === 'canceled') {
      return { status: 'cancelled' as const, gatewayPaymentId }
    }

    return { status: 'unknown' as const, gatewayPaymentId }
  }
}
