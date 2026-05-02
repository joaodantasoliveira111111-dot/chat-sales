import { CreatePixPaymentParams, PixPaymentResult, PaymentStatus } from '@/types'

export interface PaymentProvider {
  createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResult>
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
  handleWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<{
    orderId?: string
    status: 'paid' | 'cancelled' | 'expired' | 'unknown'
    gatewayPaymentId?: string
  }>
  refundPayment?(paymentId: string): Promise<boolean>
}
