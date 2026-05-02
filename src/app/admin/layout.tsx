import type { Metadata } from 'next'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Admin - Chatfy',
  description: 'Painel administrativo do Chatfy',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
