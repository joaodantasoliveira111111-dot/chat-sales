import { PaymentProvider } from '../paymentProvider'
import { CreatePixPaymentParams, PixPaymentResult, PaymentStatus } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Fake PIX EMV code for testing
function generateMockPixCode(orderId: string, amount: number): string {
  const amountStr = amount.toFixed(2).replace('.', '')
  return `00020126580014BR.GOV.BCB.PIX0136chatfy-mock-${orderId.slice(0, 8)}52040000530398654${String(amountStr).length.toString().padStart(2,'0')}${amountStr}5802BR5910Chatfy Mock6009SAO PAULO62070503***6304MOCK`
}

export class MockPaymentProvider implements PaymentProvider {
  async createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult> {
    const mockId = `mock_${uuidv4()}`
    const pixCode = generateMockPixCode(params.orderId, params.amount)
    
    // Generate a simple QR code URL (uses a public QR code API for the mock)
    const pixCodeEncoded = encodeURIComponent(pixCode)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${pixCodeEncoded}`

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    return {
      gatewayPaymentId: mockId,
      pixCode,
      pixQrCodeUrl: qrUrl,
      pixQrCodeBase64: undefined,
      expiresAt,
      status: 'created',
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Mock: always returns pending (admin must simulate manually)
    return {
      id: paymentId,
      status: 'pending',
    }
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    _headers: Record<string, string>
  ): Promise<{
    orderId?: string
    status: 'paid' | 'cancelled' | 'expired' | 'unknown'
    gatewayPaymentId?: string
  }> {
    // Mock webhook handler - supports manual simulation
    const status = payload.status as string
    const gatewayPaymentId = payload.gateway_payment_id as string
    const orderId = payload.order_id as string

    if (status === 'paid') {
      return { orderId, status: 'paid', gatewayPaymentId }
    }
    if (status === 'cancelled' || status === 'expired') {
      return { orderId, status: status as 'cancelled' | 'expired', gatewayPaymentId }
    }

    return { status: 'unknown' }
  }

  async refundPayment(_paymentId: string): Promise<boolean> {
    // Mock refund - always succeeds
    return true
  }
}
