import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'reactflow/dist/style.css'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chatfy - Checkout Conversacional',
  description: 'Venda e entregue produtos digitais no automático com checkout conversacional.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif' }}>{children}</body>
    </html>
  )
}
