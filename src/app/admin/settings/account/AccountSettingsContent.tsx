'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'

export function AccountSettingsContent({
  userId,
  email,
  initialName,
}: {
  userId: string
  email: string
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveName = async () => {
    setSavingName(true)
    setNameMsg(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      })
      if (error) throw error
      setNameMsg({ type: 'success', text: 'Nome atualizado com sucesso!' })
    } catch {
      setNameMsg({ type: 'error', text: 'Erro ao atualizar nome.' })
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePassword = async () => {
    setPasswordMsg(null)
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'As senhas não coincidem.' })
      return
    }
    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' })
    } catch {
      setPasswordMsg({ type: 'error', text: 'Erro ao alterar senha. Verifique sua senha atual.' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-[26px] font-semibold text-[#081827] tracking-tight">Minha Conta</h1>
        <p className="text-[14px] text-[#71869B] mt-1">Gerencie seu perfil e credenciais.</p>
      </div>

      {/* Profile */}
      <Card variant="neu">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#081827]">Perfil</h2>

          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />

          <div>
            <p className="text-[11px] font-semibold text-[#71869B] uppercase tracking-wide mb-1">E-mail</p>
            <p className="text-[14px] font-medium text-[#081827]">{email}</p>
            <p className="text-[11px] text-[#71869B] mt-0.5">O e-mail não pode ser alterado nesta página.</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-[#71869B] uppercase tracking-wide mb-1">ID da Conta</p>
            <p className="text-[13px] text-[#35516B] font-mono">{userId}</p>
          </div>

          {nameMsg && (
            <div className={`flex items-center gap-2 text-[13px] font-medium ${nameMsg.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {nameMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {nameMsg.text}
            </div>
          )}

          <Button
            onClick={handleSaveName}
            isLoading={savingName}
            leftIcon={<Save size={16} />}
          >
            Salvar nome
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card variant="neu">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#081827]">Alterar Senha</h2>

          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
          />

          {passwordMsg && (
            <div className={`flex items-center gap-2 text-[13px] font-medium ${passwordMsg.type === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
              {passwordMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {passwordMsg.text}
            </div>
          )}

          <Button
            onClick={handleSavePassword}
            isLoading={savingPassword}
            leftIcon={<Save size={16} />}
            disabled={!newPassword || !confirmPassword}
          >
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
