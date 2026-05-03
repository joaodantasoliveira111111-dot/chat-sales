'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Cards'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Activity, CheckCircle, Send, Shield, Zap } from 'lucide-react'

interface Props {
  initialSettings: any
  events: any[]
}

export function TrackingSettingsContent({ initialSettings, events }: Props) {
  const toast = useToast()
  const [settings, setSettings] = useState({
    is_enabled: initialSettings?.is_enabled || false,
    pixel_id: initialSettings?.pixel_id || '',
    access_token: '',
    dataset_id: initialSettings?.dataset_id || '',
    test_event_code: initialSettings?.test_event_code || '',
    verified_domain: initialSettings?.verified_domain || '',
    business_name: initialSettings?.business_name || '',
    browser_tracking_enabled: initialSettings?.browser_tracking_enabled ?? true,
    server_tracking_enabled: initialSettings?.server_tracking_enabled ?? true,
    advanced_matching_enabled: initialSettings?.advanced_matching_enabled ?? true,
    deduplication_enabled: initialSettings?.deduplication_enabled ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/meta/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error('save_failed')
      toast.success('Rastreamento salvo')
      setSettings(prev => ({ ...prev, access_token: '' }))
    } catch {
      toast.error('Erro ao salvar rastreamento')
    } finally {
      setSaving(false)
    }
  }

  const test = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/meta/test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error('test_failed')
      toast.success('Evento de teste enviado')
    } catch {
      toast.error('Falha ao enviar evento de teste')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rastreamento / Meta Pixel</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure Pixel, Conversions API, deduplicação e debug dos eventos das páginas públicas.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,149,246,0.1)', color: '#0095F6' }}>
            <Zap size={18} />
          </div>
          <div>
            <p className="font-bold">Configuração Meta</p>
            <p className="text-sm text-slate-500">O token fica salvo apenas no servidor.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Ativar rastreamento Meta" checked={settings.is_enabled} onChange={v => setSettings(s => ({ ...s, is_enabled: v }))} />
          <Toggle label="Pixel no navegador" checked={settings.browser_tracking_enabled} onChange={v => setSettings(s => ({ ...s, browser_tracking_enabled: v }))} />
          <Toggle label="Conversions API no servidor" checked={settings.server_tracking_enabled} onChange={v => setSettings(s => ({ ...s, server_tracking_enabled: v }))} />
          <Toggle label="Advanced matching" checked={settings.advanced_matching_enabled} onChange={v => setSettings(s => ({ ...s, advanced_matching_enabled: v }))} />
          <Toggle label="Deduplicação por event_id" checked={settings.deduplication_enabled} onChange={v => setSettings(s => ({ ...s, deduplication_enabled: v }))} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-5">
          <Input label="Meta Pixel ID" value={settings.pixel_id} onChange={e => setSettings(s => ({ ...s, pixel_id: e.target.value }))} placeholder="1234567890" />
          <Input label="Access Token da Conversions API" type="password" value={settings.access_token} onChange={e => setSettings(s => ({ ...s, access_token: e.target.value }))} placeholder={initialSettings?.access_token_encrypted ? 'Token já configurado' : 'EAAB...'} hint="Deixe vazio para manter o token atual." />
          <Input label="Dataset ID" value={settings.dataset_id} onChange={e => setSettings(s => ({ ...s, dataset_id: e.target.value }))} placeholder="Opcional" />
          <Input label="Test Event Code" value={settings.test_event_code} onChange={e => setSettings(s => ({ ...s, test_event_code: e.target.value }))} placeholder="TEST12345" />
          <Input label="Domínio verificado" value={settings.verified_domain} onChange={e => setSettings(s => ({ ...s, verified_domain: e.target.value }))} placeholder="seudominio.com" />
          <Input label="Nome do negócio" value={settings.business_name} onChange={e => setSettings(s => ({ ...s, business_name: e.target.value }))} placeholder="Minha operação" />
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={save} loading={saving}><CheckCircle size={16} /> Salvar configuração</Button>
          <Button variant="secondary" onClick={test} loading={testing}><Send size={16} /> Testar integração</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Activity size={18} style={{ color: '#0095F6' }} />
          <div>
            <p className="font-bold">Últimos eventos</p>
            <p className="text-sm text-slate-500">Debug de browser/server, status, event_id e resposta da Meta.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Origem</th>
                <th>Status</th>
                <th>event_id</th>
                <th>Pedido</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={6}>Nenhum evento registrado ainda.</td></tr>
              ) : events.map(event => (
                <tr key={event.id}>
                  <td>{event.meta_event_name || event.event_name}</td>
                  <td>{event.source}</td>
                  <td>{event.status}</td>
                  <td><code>{event.event_id}</code></td>
                  <td>{event.order_id || '-'}</td>
                  <td>{new Date(event.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex gap-3">
          <Shield size={18} style={{ color: '#16C784' }} />
          <p className="text-sm text-slate-500">
            O Chatfy não envia senhas, mensagens privadas ou dados de cartão. Dados pessoais enviados à Meta via CAPI são normalizados e hasheados quando aplicável; `_fbp`, `_fbc`, IP e user agent são enviados sem hash conforme esperado pela integração web.
          </p>
        </div>
      </Card>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 cursor-pointer" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.72)' }}>
      <span className="text-sm font-semibold">{label}</span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}
