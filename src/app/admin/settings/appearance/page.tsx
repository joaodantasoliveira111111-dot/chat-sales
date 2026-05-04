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
          <h1 className="text-[26px] font-semibold text-[#081827] tracking-tight">Aparência</h1>
        <p className="text-[14px] text-[#71869B] mt-1">Configure as cores e temas das suas páginas de vendas.</p>
      </div>
      <Card variant="neu">
        <CardContent className="p-6">
          <p className="text-[14px] text-[#71869B]">
            Cada página pública possui seu próprio tema e cores personalizáveis. Para ajustar, acesse <a href="/admin/pages" className="text-[#0B7CFF] font-medium hover:underline">Páginas</a> e edite a página desejada.
          </p>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}
