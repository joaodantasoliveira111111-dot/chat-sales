import { PaymentProvider } from '../paymentProvider'
import { CreatePixPaymentParams, PixPaymentResult, PaymentStatus } from '@/types'
import { v4 as uuidv4 } from 'uuid'

/**
 * AmploPay Payment Provider
 * 
 * Docs: https://app.amplopay.com/api/v1
 * Auth: x-public-key + x-secret-key headers
 * 
 * POST /gateway/pix/receive - Create PIX payment
 * GET /gateway/transactions?id={id} - Get transaction status
 * Webhook: TRANSACTION_PAID, TRANSACTION_CANCELED, etc.
 */
export class AmploPayProvider implements PaymentProvider {
  private baseUrl: string
  private publicKey: string
  private secretKey: string

  constructor(publicKey?: string, secretKey?: string) {
    this.baseUrl = process.env.AMPLOPAY_API_URL || 'https://api.amplopay.com/v1'
    this.publicKey = publicKey || process.env.AMPLOPAY_PUBLIC_KEY || ''
    this.secretKey = secretKey || process.env.AMPLOPAY_SECRET_KEY || ''
  }

  private get headers() {
    return {
      'x-public-key': this.publicKey,
      'x-secret-key': this.secretKey,
      'Content-Type': 'application/json',
    }
  }

  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult> {
    const identifier = `chatfy_${params.orderId}_${uuidv4().slice(0, 8)}`
    const webhookUrl = params.webhookUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`

    const body = {
      identifier,
      amount: params.amount,
      client: {
        name: params.customerName,
        email: params.customerEmail,
        phone: '',
        document: params.customerDocument || '',
      },
      products: [
        {
          id: params.orderId,
          name: params.description || 'Produto Digital',
          quantity: 1,
          price: params.amount,
        },
      ],
      callbackUrl: webhookUrl,
    }

    const response = await fetch(`${this.baseUrl}/gateway/pix/receive`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AmploPay error: ${error.message || response.statusText}`)
    }

    const data = await response.json()

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    return {
      gatewayPaymentId: data.transactionId,
      pixCode: data.pix?.code || '',
      pixQrCodeBase64: data.pix?.base64,
      pixQrCodeUrl: data.pix?.image,
      expiresAt,
      status: data.status === 'OK' ? 'created' : data.status,
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(
      `${this.baseUrl}/gateway/transactions?id=${paymentId}`,
      { method: 'GET', headers: this.headers }
    )

    if (!response.ok) {
      return { id: paymentId, status: 'pending' }
    }

    const data = await response.json()

    // AmploPay statuses: PENDING | COMPLETED | FAILED | REFUNDED | CHARGED_BACK
    let status: PaymentStatus['status'] = 'pending'
    if (data.status === 'COMPLETED') status = 'paid'
    else if (data.status === 'FAILED' || data.status === 'REFUNDED') status = 'cancelled'

    return { id: paymentId, status, raw: data }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ) {
    // AmploPay webhook events: TRANSACTION_PAID, TRANSACTION_CANCELED, etc.
    const event = payload.event as string
    const transaction = payload.transaction as Record<string, unknown>
    const gatewayPaymentId = transaction?.id as string

    if (event === 'TRANSACTION_PAID') {
      return { status: 'paid' as const, gatewayPaymentId }
    }
    if (event === 'TRANSACTION_CANCELED' || event === 'TRANSACTION_REFUNDED') {
      return { status: 'cancelled' as const, gatewayPaymentId }
    }

    return { status: 'unknown' as const, gatewayPaymentId }
  }
}
