'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { copyToClipboard } from '@/lib/utils'
import { CreditCard, Copy, CheckCircle, AlertCircle, Zap, Globe } from 'lucide-react'

const PROVIDERS = [
  {
    id: 'mock',
    name: 'Mock (Desenvolvimento)',
    desc: 'Provider de teste. Gera PIX fake e permite simular pagamentos manualmente.',
    icon: '🧪',
    fields: [],
  },
  {
    id: 'pushinpay',
    name: 'PushinPay',
    desc: 'Integração com a API da PushinPay via Bearer Token.',
    icon: '💳',
    fields: [
      { key: 'PUSHINPAY_TOKEN', label: 'Token de acesso', type: 'password', placeholder: 'Seu token PushinPay' },
    ],
  },
  {
    id: 'amplopay',
    name: 'AmploPay',
    desc: 'Integração com a API da AmploPay via chave pública + privada.',
    icon: '🏦',
    fields: [
      { key: 'AMPLOPAY_PUBLIC_KEY', label: 'Chave pública', type: 'text', placeholder: 'x-public-key' },
      { key: 'AMPLOPAY_SECRET_KEY', label: 'Chave secreta', type: 'password', placeholder: 'x-secret-key' },
    ],
  },
]

export function PaymentSettingsContent({
  userId,
  currentProvider,
  appUrl,
}: {
  userId: string
  currentProvider: string
  appUrl: string
}) {
  const toast = useToast()
  const [copiedWebhook, setCopiedWebhook] = useState(false)

  const webhookUrl = `${appUrl}/api/payments/webhook`

  const handleCopyWebhook = async () => {
    await copyToClipboard(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
    toast.success('URL do webhook copiada!')
  }

  const currentProviderInfo = PROVIDERS.find(p => p.id === currentProvider) || PROVIDERS[0]

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações de Pagamento</h1>
        <p className="text-slate-400 text-sm mt-1">Configure o gateway de pagamento para receber Pix.</p>
      </div>

      {/* Current provider */}
      <GlassCard>
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Provider Ativo</p>
            <p className="text-xs text-slate-400 mt-0.5">Definido via variável de ambiente <code className="text-violet-400">PAYMENT_PROVIDER</code></p>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          currentProvider === 'mock'
            ? 'border-yellow-500/30 bg-yellow-500/5'
            : 'border-green-500/30 bg-green-500/5'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentProviderInfo.icon}</span>
            <div>
              <p className="text-sm font-bold text-white">{currentProviderInfo.name}</p>
              <p className="text-xs text-slate-400">{currentProviderInfo.desc}</p>
            </div>
            {currentProvider === 'mock' ? (
              <AlertCircle size={18} className="ml-auto text-yellow-400" />
            ) : (
              <CheckCircle size={18} className="ml-auto text-green-400" />
            )}
          </div>
        </div>

        {currentProvider === 'mock' && (
          <div className="mt-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
            <p className="text-xs text-yellow-300 font-medium mb-1">⚠️ Modo Mock Ativo</p>
            <p className="text-xs text-slate-400">
              Em modo mock, os PIX gerados são falsos. Você pode simular pagamentos aprovados no painel de pedidos.
              Para ativar um gateway real, altere <code className="text-violet-400">PAYMENT_PROVIDER</code> no arquivo <code className="text-violet-400">.env.local</code>.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Available providers */}
      <GlassCard>
        <p className="text-sm font-bold text-white mb-4">Providers Disponíveis</p>
        <div className="space-y-3">
          {PROVIDERS.filter(p => p.id !== 'mock').map(provider => (
            <div key={provider.id} className="p-4 rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{provider.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{provider.name}</p>
                  <p className="text-xs text-slate-400">{provider.desc}</p>
                </div>
                {currentProvider === provider.id && (
                  <span className="ml-auto text-xs bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full">Ativo</span>
                )}
              </div>
              <div className="mt-3 p-3 rounded-lg bg-black/20">
                <p className="text-xs text-slate-500 mb-1">Para ativar, adicione ao .env.local:</p>
                <code className="text-xs text-violet-400">PAYMENT_PROVIDER={provider.id}</code>
                {provider.fields.map(f => (
                  <div key={f.key}>
                    <br />
                    <code className="text-xs text-violet-400">{f.key}=seu_valor_aqui</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Webhook URL */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">URL do Webhook</p>
            <p className="text-xs text-slate-400">Configure no painel do gateway para receber notificações automáticas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <code className="flex-1 text-xs text-slate-300 bg-black/30 px-4 py-3 rounded-xl break-all border border-white/8">
            {webhookUrl}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyWebhook}
            className="flex-shrink-0"
          >
            {copiedWebhook ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
            {copiedWebhook ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
          <p className="text-xs text-blue-300 font-medium mb-1">Importante</p>
          <p className="text-xs text-slate-400">
            Cole esta URL no campo de webhook do seu gateway de pagamento. O sistema processará automaticamente
            as notificações de pagamento aprovado e fará a entrega do produto.
          </p>
        </div>
      </GlassCard>

      {/* Test mode info */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
            <Zap size={20} />
          </div>
          <p className="text-sm font-bold text-white">Como Funciona o Fluxo de Pagamento</p>
        </div>
        <ol className="space-y-2">
          {[
            'Visitante preenche dados e clica em comprar',
            'Sistema cria pedido e gera QR Code Pix via gateway',
            'Visitante paga o Pix no app bancário',
            'Gateway envia webhook confirmando o pagamento',
            'Sistema processa o webhook e confirma o pedido',
            'Entrega automática é executada',
            'Visitante recebe o produto dentro do chat',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <p className="text-xs text-slate-400 pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  )
}
