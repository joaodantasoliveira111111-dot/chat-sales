import { NextResponse } from 'next/server'

export function isMissingServiceRoleError(error: unknown) {
  return error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')
}

export function missingServiceRoleResponse() {
  return NextResponse.json(
    {
      error: 'Configuração do servidor incompleta',
      detail: 'SUPABASE_SERVICE_ROLE_KEY não está configurada no ambiente deste servidor.',
      fix: 'Copie a service_role key no Supabase Dashboard em Project Settings > API, configure como variável secreta de servidor e reinicie/republique o app.',
    },
    { status: 500 }
  )
}
