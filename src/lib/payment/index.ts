import { PaymentProvider } from './paymentProvider'
import { MockPaymentProvider } from './providers/mockProvider'
import { PushinPayProvider } from './providers/pushinPayProvider'
import { AmploPayProvider } from './providers/amploPayProvider'
import { createAdminClient } from '@/lib/supabase/middleware'

export async function getPaymentProvider(userId: string): Promise<{ provider: PaymentProvider; providerName: string }> {
  const supabase = createAdminClient()

  // Get active gateway for user
  const { data: activeData } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('key', 'active_gateway')
    .single()

  const providerName = (activeData?.value as any)?.provider || 'mock'

  // Get credentials
  const { data: credsData } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('user_id', userId)
    .eq('key', `gateway_${providerName}`)
    .single()

  const credentials = (credsData?.value as Record<string, string>) || {}

  let provider: PaymentProvider

  switch (providerName) {
    case 'pushinpay':
      provider = new PushinPayProvider(credentials.token)
      break
  case 'amplopay':
    provider = new AmploPayProvider(credentials.public_key || credentials.pix_public_key, credentials.secret_key || credentials.pix_secret_key)
    break
    case 'mock':
    default:
      provider = new MockPaymentProvider()
      break
  }

  return { provider, providerName }
}
