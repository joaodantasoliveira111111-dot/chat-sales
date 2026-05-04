import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/Card'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-[26px] font-semibold text-[#081827] tracking-tight">Minha Conta</h1>
          <p className="text-[14px] text-[#71869B] mt-1">Gerencie seu perfil e credenciais.</p>
        </div>
        <Card variant="neu">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-[11px] font-semibold text-[#71869B] uppercase tracking-wide mb-1">E-mail</p>
              <p className="text-[14px] font-medium text-[#081827]">{user.email}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#71869B] uppercase tracking-wide mb-1">ID da Conta</p>
              <p className="text-[13px] text-[#35516B] font-mono">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
