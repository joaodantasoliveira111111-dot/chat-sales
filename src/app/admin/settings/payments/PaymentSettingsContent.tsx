'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
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
}: {
  userId: string
  appUrl: string
}) {
  const toast = useToast()
  const [activeGateway, setActiveGateway] = useState('mock')
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

      toast.success('Configurações salvas com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err.message || 'tente novamente'))
    } finally {
      setSaving(false)
    }
  }

  const handleCopyWebhook = async () => {
    await copyToClipboard(webhookUrl)
    setCopiedWebhook(true)
    setTimeout(() => setCopiedWebhook(false), 2000)
    toast.success('URL copiada!')
  }

  const activeConfig = GATEWAYS.find(g => g.id === activeGateway) || GATEWAYS[0]

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '720px' }}>
        <div className="skeleton" style={{ height: '40px', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '180px', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '140px' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '720px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Pagamentos
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          Configure o gateway de Pix para receber pagamentos automaticamente.
        </p>
      </div>

      {/* Gateway Selector */}
      <Card className="mb-4" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary-light)',
          }}>
            <CreditCard size={18} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Gateway Ativo</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Selecione e configure o gateway de pagamento
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '0.625rem' }}>
          {GATEWAYS.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGateway(g.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: activeGateway === g.id
                  ? '1px solid rgba(124,58,237,0.5)'
                  : '1px solid var(--border)',
                background: activeGateway === g.id
                  ? 'rgba(124,58,237,0.08)'
                  : 'var(--bg-base)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{g.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.desc}</p>
              </div>
              {activeGateway === g.id && (
                <CheckCircle size={18} style={{ color: '#34D399', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {activeGateway === 'mock' && (
          <div style={{
            marginTop: '1rem', padding: '0.875rem', borderRadius: '10px',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertCircle size={14} style={{ color: '#FBBF24' }} />
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FBBF24' }}>Modo de desenvolvimento ativo</p>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Em modo Mock, os QR codes Pix são falsos e os pagamentos não são reais. Ideal para testar o fluxo sem cobrar clientes.
            </p>
          </div>
        )}
      </Card>

      {/* Gateway Credentials */}
      {activeConfig.fields.length > 0 && (
        <Card style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#34D399',
            }}>
              <Shield size={18} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>
                Credenciais — {activeConfig.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Salvas com segurança. Nunca expostas no frontend.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeConfig.fields.map(field => (
              <div key={field.key}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--text-muted)', marginBottom: '0.375rem',
                }}>
                  {field.label}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                    value={credentials[activeGateway]?.[field.key] || ''}
                    onChange={e => handleCredentialChange(activeGateway, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="neu-input"
                    style={{ paddingRight: field.type === 'password' ? '2.5rem' : undefined }}
                  />
                  {field.type === 'password' && (
                    <button
                      onClick={() => setShowSecrets(p => ({ ...p, [field.key]: !p[field.key] }))}
                      style={{
                        position: 'absolute', right: '0.75rem',
                        background: 'transparent', border: 'none',
                        color: 'var(--text-subtle)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {showSecrets[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Webhook URL */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(6,182,212,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#67E8F9',
          }}>
            <Globe size={18} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>URL do Webhook</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure no painel do gateway para confirmação automática</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <code style={{
            flex: 1, fontSize: '0.75rem', color: 'var(--text)',
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: '10px', padding: '0.625rem 0.875rem',
            wordBreak: 'break-all',
          }}>
            {webhookUrl}
          </code>
          <Button variant="secondary" size="sm" onClick={handleCopyWebhook} style={{ flexShrink: 0 }}>
            {copiedWebhook ? <CheckCircle size={14} style={{ color: '#34D399' }} /> : <Copy size={14} />}
            {copiedWebhook ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
      </Card>

      {/* Flow explanation */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary-light)',
          }}>
            <Zap size={18} />
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)' }}>Como funciona</p>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[
            'Cliente preenche dados e inicia o checkout no chat',
            'Sistema gera o QR Code Pix via gateway configurado',
            'Cliente efetua o pagamento no app do banco',
            'Gateway envia o webhook confirmando o pagamento',
            'Sistema processa, confirma o pedido e entrega o produto',
          ].map((step, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{
                flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                background: 'rgba(124,58,237,0.15)', color: 'var(--primary-light)',
                fontSize: '0.7rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.125rem', lineHeight: 1.5 }}>{step}</p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Save button */}
      <Button onClick={handleSave} loading={saving} size="lg">
        <Save size={16} />
        Salvar configurações
      </Button>
    </div>
  )
}
