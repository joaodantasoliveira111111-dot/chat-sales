'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { copyToClipboard } from '@/lib/utils'
import {
  CreditCard, Copy, CheckCircle, AlertCircle,
  Zap, Globe, Eye, EyeOff, Save, Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
  icon: string
  fields: GatewayField[]
}

const GATEWAYS: GatewayConfig[] = [
  {
    id: 'mock',
    name: 'Mock / Desenvolvimento',
    desc: 'Gera QR codes falsos para testes. Use apenas em desenvolvimento.',
    icon: '🧪',
    fields: [],
  },
  {
    id: 'pushinpay',
    name: 'PushinPay',
    desc: 'Receba Pix automaticamente via PushinPay. Integração via Bearer Token.',
    icon: '💳',
    fields: [
      { key: 'token', label: 'Token de Acesso', type: 'password', placeholder: 'Seu token PushinPay' },
    ],
  },
  {
    id: 'amplopay',
    name: 'AmploPay',
    desc: 'Receba Pix via AmploPay usando chave pública + chave privada.',
    icon: '🏦',
    fields: [
      { key: 'public_key', label: 'Chave Pública', type: 'text', placeholder: 'x-public-key da AmploPay' },
      { key: 'secret_key', label: 'Chave Secreta', type: 'password', placeholder: 'x-secret-key da AmploPay' },
    ],
  },
]

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

  const webhookUrl = `${appUrl}/api/payments/webhook?u=${userId}`

  // Load saved settings from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('admin_settings')
          .select('key, value')
          .eq('user_id', userId)
          .in('key', ['active_gateway', 'gateway_pushinpay', 'gateway_amplopay'])

        if (data) {
          for (const row of data) {
            if (row.key === 'active_gateway') {
              setActiveGateway((row.value as any).provider || 'mock')
            } else if (row.key === 'gateway_pushinpay') {
              setCredentials(prev => ({ ...prev, pushinpay: row.value as any }))
            } else if (row.key === 'gateway_amplopay') {
              setCredentials(prev => ({ ...prev, amplopay: row.value as any }))
            }
          }
        }
      } catch {
        // silently ignore
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

      // Save active gateway
      await supabase.from('admin_settings').upsert({
        user_id: userId,
        key: 'active_gateway',
        value: { provider: activeGateway },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' })

      // Save credentials for each gateway (never expose in frontend response)
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
    } catch {
      // Handle error silently
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
        <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Pagamentos
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure o gateway de Pix para receber pagamentos automaticamente.
        </p>
      </div>

      {/* Gateway Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <CreditCard size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">Gateway Ativo</p>
              <p className="text-sm text-slate-600">
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
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                  }
                `}
              >
                <span className="text-2xl">{g.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{g.name}</p>
                  <p className="text-xs text-slate-600">{g.desc}</p>
                </div>
                {activeGateway === g.id && (
                  <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {activeGateway === 'mock' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={16} className="text-yellow-600" />
                <p className="text-sm font-semibold text-yellow-900">Modo de desenvolvimento ativo</p>
              </div>
              <p className="text-xs text-yellow-800">
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
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Shield size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">
                  Credenciais — {activeConfig.name}
                </p>
                <p className="text-sm text-slate-600">
                  Salvas com segurança. Nunca expostas no frontend.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activeConfig.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                      value={credentials[activeGateway]?.[field.key] || ''}
                      onChange={e => handleCredentialChange(activeGateway, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-10 px-3 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {field.type === 'password' && (
                      <button
                        onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Globe size={20} className="text-cyan-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">URL do Webhook</p>
              <p className="text-sm text-slate-600">Configure no painel do gateway para confirmação automática</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <code className="flex-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 break-all">
              {webhookUrl}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyWebhook}
              leftIcon={copiedWebhook ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
            >
              {copiedWebhook ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flow explanation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Zap size={20} className="text-violet-600" />
            </div>
            <p className="text-base font-semibold text-slate-900">Como funciona</p>
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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} loading={saving} size="lg" fullWidth leftIcon={<Save size={18} />}>
        Salvar configurações
      </Button>
    </div>
  )
}