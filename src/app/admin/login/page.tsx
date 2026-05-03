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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <ChatfyLogo />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4">
              <ShieldCheck size={14} />
              <span>Acesso restrito a administradores</span>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Bem-vindo de volta
            </h1>
            
            <p className="text-slate-600">
              Entre na sua conta para gerenciar sua operação
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-slate-600">Lembrar-me</span>
              </label>
              
              <a
                href="#"
                className="text-primary-600 hover:text-primary-700 font-medium"
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

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Precisa de ajuda?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Entre em contato
              </a>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  )
}