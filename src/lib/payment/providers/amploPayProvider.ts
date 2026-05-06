import { PaymentProvider } from '../paymentProvider'
import { CreatePixPaymentParams, PixPaymentResult, PaymentStatus } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class AmploPayProvider implements PaymentProvider {
  private baseUrl: string
  private publicKey: string
  private secretKey: string

  constructor(publicKey?: string, secretKey?: string) {
    this.baseUrl = process.env.AMPLOPAY_API_URL || 'https://app.amplopay.com/api/v1'
    this.publicKey = publicKey || process.env.PIX_PUBLIC_KEY || process.env.AMPLOPAY_PUBLIC_KEY || ''
    this.secretKey = secretKey || process.env.PIX_SECRET_KEY || process.env.AMPLOPAY_SECRET_KEY || ''
  }

  private get headers() {
    return {
      'x-public-key': this.publicKey,
      'x-secret-key': this.secretKey,
      'Content-Type': 'application/json',
    }
  }

  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult> {
    const identifier = `chatfy_${uuidv4()}`

    const body = {
      identifier,
      amount: params.amount,
      client: {
        name: params.customerName,
        email: params.customerEmail,
        phone: params.customerPhone || '',
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
      callbackUrl: params.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    }

    const response = await fetch(`${this.baseUrl}/gateway/pix/receive`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.status === 400) {
      const errMsg = data.message || data.errorCode || 'Erro na cobrança PIX'
      const details = data.details?.field ? ` (${data.details.field}: ${data.details.issue})` : ''
      throw new Error(`AmploPay: ${errMsg}${details}`)
    }

    if (response.status !== 201) {
      throw new Error(`AmploPay: status inesperado ${response.status} - ${JSON.stringify(data)}`)
    }

    const pixCode = data.pix?.code || ''
    if (!pixCode) {
      throw new Error('AmploPay: pix.code vazio na resposta')
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    return {
      gatewayPaymentId: data.transactionId || '',
      pixCode,
      pixQrCodeUrl: qrUrl,
      pixQrCodeBase64: undefined,
      expiresAt,
      status: data.status === 'OK' ? 'created' : data.status?.toLowerCase() || 'created',
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

    let status: PaymentStatus['status'] = 'pending'
    if (data.status === 'COMPLETED' || data.status === 'OK') status = 'paid'
    else if (data.status === 'FAILED' || data.status === 'REFUNDED' || data.status === 'CANCELED') status = 'cancelled'

    return { id: paymentId, status, raw: data }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ) {
    const event = payload.event as string
    const transaction = payload.transaction as Record<string, unknown> | undefined
    const gatewayPaymentId = (transaction?.id || payload.transactionId) as string | undefined

    if (event === 'TRANSACTION_PAID') {
      return { status: 'paid' as const, gatewayPaymentId }
    }
    if (event === 'TRANSACTION_CANCELED' || event === 'TRANSACTION_REFUNDED') {
      return { status: 'cancelled' as const, gatewayPaymentId }
    }

    return { status: 'unknown' as const, gatewayPaymentId }
  }
}
