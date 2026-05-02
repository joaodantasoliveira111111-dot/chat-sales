import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { GlassCard } from '@/components/ui/Cards'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Minha Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie seu perfil e credenciais.</p>
        </div>
        <GlassCard>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">E-mail</p>
              <p className="text-sm font-medium text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">ID da Conta</p>
              <p className="text-sm text-slate-400 font-mono text-xs">{user.id}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  )
}
