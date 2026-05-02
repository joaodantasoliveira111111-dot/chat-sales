'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Globe,
  Workflow,
  Archive,
  ShoppingCart,
  HeadphonesIcon,
  Settings,
  ChevronRight,
  LogOut,
  MessageSquare,
  Menu,
  X,
  CreditCard,
  Palette,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Produtos', href: '/admin/products', icon: Package },
      { label: 'Páginas', href: '/admin/pages', icon: Globe },
      { label: 'Fluxos', href: '/admin/flows', icon: Workflow },
    ],
  },
  {
    title: 'Operações',
    items: [
      { label: 'Estoque', href: '/admin/inventory', icon: Archive },
      { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Suporte', href: '/admin/support', icon: HeadphonesIcon },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { label: 'Pagamentos', href: '/admin/settings/payments', icon: CreditCard },
      { label: 'Aparência', href: '/admin/settings/appearance', icon: Palette },
      { label: 'Conta', href: '/admin/settings/account', icon: User },
    ],
  },
]

export function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className={cn(
      'flex flex-col h-full',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-violet-500/30">
            <MessageSquare size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Chatfy</span>
        </Link>
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4">
        {navItems.map(section => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(item.href, item.exact)
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon size={16} className={isActive(item.href, item.exact) ? 'text-violet-400' : ''} />
                  {item.label}
                  {isActive(item.href, item.exact) && (
                    <ChevronRight size={14} className="ml-auto text-violet-400" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-white/5 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Produtos'
    if (pathname.startsWith('/admin/pages')) return 'Páginas Públicas'
    if (pathname.startsWith('/admin/flows')) return 'Fluxos'
    if (pathname.startsWith('/admin/inventory')) return 'Estoque'
    if (pathname.startsWith('/admin/orders')) return 'Pedidos'
    if (pathname.startsWith('/admin/support')) return 'Suporte'
    if (pathname.startsWith('/admin/settings/payments')) return 'Configurações de Pagamento'
    if (pathname.startsWith('/admin/settings/appearance')) return 'Aparência'
    if (pathname.startsWith('/admin/settings')) return 'Configurações'
    return 'Chatfy'
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col border-r border-white/5 flex-shrink-0 overflow-y-auto"
        style={{ background: '#0d0d15', width: '256px' }}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex flex-col h-full w-72 border-r border-white/10"
            style={{ background: '#0d0d15' }}>
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 lg:px-6 flex-shrink-0"
          style={{ background: '#0d0d15' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 mr-3"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-white">{getPageTitle()}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
