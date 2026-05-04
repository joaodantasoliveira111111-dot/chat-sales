'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ChatfyLogo } from '@/components/ui/ChatfyLogo'
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('E-mail ou senha inválidos. Verifique suas credenciais.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Não foi possível entrar agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F7FB] p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ChatfyLogo />
        </div>

        <div className="bg-white rounded-[22px] shadow-[10px_10px_24px_rgba(8,24,39,0.06),-8px_-8px_20px_rgba(255,255,255,0.8)] border border-[rgba(8,24,39,0.08)] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.12)] text-[#16A34A] text-[13px] font-semibold mb-4">
              <ShieldCheck size={14} />
              <span>Acesso restrito a administradores</span>
            </div>

            <h1 className="text-[26px] font-semibold text-[#081827] tracking-tight mb-2">
              Bem-vindo de volta
            </h1>

            <p className="text-[14px] text-[#71869B]">
              Entre na sua conta para gerenciar sua operação
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.12)] rounded-xl">
              <p className="text-[13px] text-[#DC2626]">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              leftIcon={<Mail size={18} />}
              required
              fullWidth
            />

            <Input
              id="password"
              type="password"
              label="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={18} />}
              required
              fullWidth
            />

            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[rgba(8,24,39,0.14)] text-[#0B7CFF] focus:ring-[rgba(0,194,255,0.15)]"
                />
                <span className="text-[#35516B]">Lembrar-me</span>
              </label>

              <a
                href="#"
                className="text-[#0B7CFF] hover:text-[#0A6FE6] font-medium"
              >
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              fullWidth
              rightIcon={<ArrowRight size={18} />}
            >
              Entrar na conta
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(8,24,39,0.08)] text-center">
            <p className="text-[13px] text-[#71869B]">
              Precisa de ajuda?{' '}
              <a href="#" className="text-[#0B7CFF] hover:text-[#0A6FE6] font-medium">
                Entre em contato
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#94A3B8]">
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  )
}
