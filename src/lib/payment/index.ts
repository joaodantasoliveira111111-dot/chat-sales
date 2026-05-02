import { PaymentProvider } from './paymentProvider'
import { MockPaymentProvider } from './providers/mockProvider'
import { PushinPayProvider } from './providers/pushinPayProvider'
import { AmploPayProvider } from './providers/amploPayProvider'

let _provider: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider

  const providerName = process.env.PAYMENT_PROVIDER || 'mock'

  switch (providerName) {
    case 'pushinpay':
      _provider = new PushinPayProvider()
      break
    case 'amplopay':
      _provider = new AmploPayProvider()
      break
    case 'mock':
    default:
      _provider = new MockPaymentProvider()
      break
  }

  return _provider
}
