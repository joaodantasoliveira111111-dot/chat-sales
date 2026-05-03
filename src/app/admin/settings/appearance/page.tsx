import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/Card'

export default async function AppearanceSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Aparência</h1>
          <p className="text-slate-400 text-sm mt-1">Configure as cores e temas globais do sistema.</p>
        </div>
        <GlassCard>
          <p className="text-sm text-slate-300">Em desenvolvimento. Atualmente, os temas são configurados diretamente na página pública.</p>
        </GlassCard>
      </div>
    </AdminLayout>
  )
}
