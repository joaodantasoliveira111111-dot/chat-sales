'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { copyToClipboard } from '@/lib/utils'
import {
  CreditCard, Copy, CheckCircle, AlertCircle,
  Zap, Globe, Eye, EyeOff, Save, Shield,
  FlaskConical, Landmark, RefreshCw,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

interface GatewayField {
  key: string
  label: string
  type: 'text' | 'password'
  placeholder: string
}

interface GatewayConfig {
  id: string
  name: string
  desc: string
  icon: 'flask' | 'credit-card' | 'landmark'
  fields: GatewayField[]
}

const GATEWAYS: GatewayConfig[] = [
  {
    id: 'mock',
    name: 'Mock / Desenvolvimento',
    desc: 'Gera QR codes falsos para testes. Use apenas em desenvolvimento.',
    icon: 'flask',
    fields: [],
  },
  {
    id: 'pushinpay',
    name: 'PushinPay',
    desc: 'Receba Pix automaticamente via PushinPay. Integração via Bearer Token.',
    icon: 'credit-card',
    fields: [
      { key: 'token', label: 'Token de Acesso', type: 'password', placeholder: 'Seu token PushinPay' },
    ],
  },
  {
    id: 'amplopay',
    name: 'AmploPay',
    desc: 'Receba Pix via AmploPay usando chave pública + chave privada.',
    icon: 'landmark',
    fields: [
      { key: 'public_key', label: 'Chave Pública', type: 'text', placeholder: 'x-public-key da AmploPay' },
      { key: 'secret_key', label: 'Chave Secreta', type: 'password', placeholder: 'x-secret-key da AmploPay' },
    ],
  },
]

function GatewayIcon({ icon }: { icon: 'flask' | 'credit-card' | 'landmark' }) {
  const config = {
    flask: { Icon: FlaskConical, bg: 'bg-[rgba(249,115,22,0.08)]', color: 'text-[#F97316]' },
    'credit-card': { Icon: CreditCard, bg: 'bg-[rgba(11,124,255,0.08)]', color: 'text-[#0B7CFF]' },
    landmark: { Icon: Landmark, bg: 'bg-[rgba(109,93,246,0.08)]', color: 'text-[#6D5DF6]' },
  }[icon]
  return (
    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} flex-shrink-0`}>
      <config.Icon size={20} />
    </div>
  )
}

export function PaymentSettingsContent({
  userId,
  appUrl,
  currentProvider = 'mock',
}: {
  userId: string
  appUrl: string
  currentProvider?: string
}) {
  const [activeGateway, setActiveGateway] = useState(currentProvider)
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copiedWebhook, setCopiedWebhook] = useState(false)
  const [webhookSecret, setWebhookSecret] = useState('')
  const toast = useToast()

  const webhookUrl = `${appUrl}/api/payments/webhook?u=${userId}&s=${webhookSecret}`

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('user_id', userId)
          .in('key', ['active_gateway', 'gateway_pushinpay', 'gateway_amplopay', 'webhook_secret'])

        if (data) {
          for (const row of data) {
            if (row.key === 'active_gateway') {
              setActiveGateway((row.value as any).provider || 'mock')
            } else if (row.key === 'gateway_pushinpay') {
              setCredentials(prev => ({ ...prev, pushinpay: row.value as any }))
            } else if (row.key === 'gateway_amplopay') {
              setCredentials(prev => ({ ...prev, amplopay: row.value as any }))
            } else if (row.key === 'webhook_secret') {
              setWebhookSecret((row.value as any)?.secret || '')
            }
          }
        }
} catch {
      toast.error('Erro ao carregar configurações de pagamento')
    } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  const handleCredentialChange = (gatewayId: string, fieldKey: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [gatewayId]: { ...(prev[gatewayId] || {}), [fieldKey]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      await supabase.from('admin_settings').upsert({
        user_id: userId,
        key: 'active_gateway',
        value: { provider: activeGateway },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' })

      for (const gateway of GATEWAYS.filter(g => g.fields.length > 0)) {
        const creds = credentials[gateway.id]
        if (creds && Object.keys(creds).length > 0) {
          await supabase.from('admin_settings').upsert({
            user_id: userId,
            key: `gateway_${gateway.id}`,
            value: creds,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,key' })
        }
      }

      let secret = webhookSecret
      if (!secret) {
        secret = crypto.randomUUID()
        setWebhookSecret(secret)
      }
      await supabase.from('admin_settings').upsert({
        user_id: userId,
        key: 'webhook_secret',
        value: { secret },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' })
      toast.success('Configurações salvas com sucesso')
    } catch {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyWebhook = async () => {
    await copyToClipboard(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
  }

  const activeConfig = GATEWAYS.find(g => g.id === activeGateway) || GATEWAYS[0]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#EAF1F8] rounded-xl animate-pulse" />
        <div className="h-48 bg-[#EAF1F8] rounded-xl animate-pulse" />
        <div className="h-40 bg-[#EAF1F8] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#081827]">
          Pagamentos
        </h1>
        <p className="text-sm text-[#35516B] mt-1">
          Configure o gateway de Pix para receber pagamentos automaticamente.
        </p>
      </div>

      {/* Gateway Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[rgba(11,124,255,0.08)] flex items-center justify-center">
          <CreditCard size={20} className="text-[#0B7CFF]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#081827]">Gateway Ativo</p>
              <p className="text-sm text-[#35516B]">
                Selecione e configure o gateway de pagamento
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {GATEWAYS.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGateway(g.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
                  ${activeGateway === g.id
                    ? 'border-[#0B7CFF] bg-[rgba(11,124,255,0.04)]'
                    : 'border-[rgba(8,24,39,0.08)] hover:border-[rgba(8,24,39,0.08)] bg-white'
                  }
                `}
              >
                <GatewayIcon icon={g.icon} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#081827]">{g.name}</p>
                  <p className="text-xs text-[#35516B]">{g.desc}</p>
                </div>
                {activeGateway === g.id && (
                  <CheckCircle size={20} className="text-[#16A34A] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {activeGateway === 'mock' && (
        <div className="mt-4 p-4 bg-[rgba(234,179,8,0.06)] rounded-xl border border-[rgba(234,179,8,0.15)]">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-[#CA8A04]" />
            <p className="text-sm font-semibold text-[#854D0E]">Modo de desenvolvimento ativo</p>
          </div>
          <p className="text-xs text-[#92400E]">
                Em modo Mock, os QR codes Pix são falsos e os pagamentos não são reais. Ideal para testar o fluxo sem cobrar clientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gateway Credentials */}
      {activeConfig.fields.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[rgba(22,163,74,0.08)] flex items-center justify-center">
          <Shield size={20} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#081827]">
                  Credenciais — {activeConfig.name}
                </p>
                <p className="text-sm text-[#35516B]">
                  Salvas com segurança. Nunca expostas no frontend.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activeConfig.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-[#4A6178] mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                      value={credentials[activeGateway]?.[field.key] || ''}
                      onChange={e => handleCredentialChange(activeGateway, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 pr-10 text-sm bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl focus:outline-none focus:border-[#0B7CFF] focus:shadow-[0_0_0_3px_rgba(0,194,255,0.15)] text-[#081827]"
                    />
                    {field.type === 'password' && (
                      <button
                        onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71869B] hover:text-[#35516B]"
                      >
                        {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    {/* Webhook URL */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,194,255,0.08)] flex items-center justify-center">
            <Globe size={20} className="text-[#00C2FF]" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#081827]">URL do Webhook</p>
            <p className="text-sm text-[#35516B]">Configure no painel do gateway para confirmação automática</p>
          </div>
        </div>
        {!webhookSecret && (
          <div className="mb-4 p-4 bg-[rgba(234,179,8,0.06)] rounded-xl border border-[rgba(234,179,8,0.15)]">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-[#CA8A04]" />
              <p className="text-sm font-semibold text-[#854D0E]">Webhook não protegido</p>
            </div>
            <p className="text-xs text-[#92400E]">
              Salve as configurações para gerar um secret de verificação. Isso protege seu webhook contra chamadas falsas.
            </p>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <code className="flex-1 text-xs text-[#4A6178] bg-[#F3F7FB] border border-[rgba(8,24,39,0.08)] rounded-xl p-3 break-all">
            {webhookSecret ? webhookUrl : `${appUrl}/api/payments/webhook?u=${userId}`}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyWebhook}
            leftIcon={copiedWebhook ? <CheckCircle size={16} className="text-[#16A34A]" /> : <Copy size={16} />}
          >
            {copiedWebhook ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
        {webhookSecret && (
          <button
            onClick={async () => {
              const newSecret = crypto.randomUUID()
              setWebhookSecret(newSecret)
              const supabase = createClient()
              await supabase.from('admin_settings').upsert({
                user_id: userId,
                key: 'webhook_secret',
                value: { secret: newSecret },
                updated_at: new Date().toISOString(),
              }, { onConflict: 'user_id,key' })
            }}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#71869B] hover:text-[#35516B] font-medium transition-colors"
          >
            <RefreshCw size={12} />
            Regenerar secret
          </button>
        )}
      </CardContent>
    </Card>

      {/* Flow explanation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(109,93,246,0.08)] flex items-center justify-center">
          <Zap size={20} className="text-[#6D5DF6]" />
            </div>
            <p className="text-base font-semibold text-[#081827]">Como funciona</p>
          </div>
          <ol className="space-y-3">
            {[
              'Cliente preenche dados e inicia o checkout no chat',
              'Sistema gera o QR Code Pix via gateway configurado',
              'Cliente efetua o pagamento no app do banco',
              'Gateway envia o webhook confirmando o pagamento',
              'Sistema processa, confirma o pedido e entrega o produto',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[rgba(109,93,246,0.08)] text-[#6D5DF6] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-[#35516B] pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} isLoading={saving} size="lg" fullWidth leftIcon={<Save size={18} />}>
        Salvar configurações
      </Button>
    </div>
  )
}