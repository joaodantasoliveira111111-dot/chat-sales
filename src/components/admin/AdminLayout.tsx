'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Globe,
  Workflow,
  Archive,
  ShoppingCart,
  HeadphonesIcon,
  CreditCard,
  User,
  LogOut,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      { label: 'Produtos', href: '/admin/products', icon: Package },
      { label: 'Páginas', href: '/admin/pages', icon: Globe },
      { label: 'Fluxos', href: '/admin/flows', icon: Workflow },
    ],
  },
  {
    label: 'Operações',
    items: [
      { label: 'Estoque', href: '/admin/inventory', icon: Archive },
      { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Suporte', href: '/admin/support', icon: HeadphonesIcon },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { label: 'Pagamentos', href: '/admin/settings/payments', icon: CreditCard },
      { label: 'Conta', href: '/admin/settings/account', icon: User },
    ],
  },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname.startsWith(href) && (pathname === href || pathname[href.length] === '/')
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
        >
          <MessageSquare size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Chatfy</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>Admin Panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="sidebar-nav-label">{group.label}</p>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn('sidebar-nav-item', active && 'active')}
                >
                  <item.icon size={15} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-left"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#F87171'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = ''
            ;(e.currentTarget as HTMLElement).style.background = ''
          }}
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const pageTitle = (() => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Produtos'
    if (pathname.startsWith('/admin/pages')) return 'Páginas Públicas'
    if (pathname.startsWith('/admin/flows')) return 'Fluxos'
    if (pathname.startsWith('/admin/inventory')) return 'Estoque'
    if (pathname.startsWith('/admin/orders')) return 'Pedidos'
    if (pathname.startsWith('/admin/support')) return 'Suporte'
    if (pathname.startsWith('/admin/settings/payments')) return 'Pagamentos'
    if (pathname.startsWith('/admin/settings/account')) return 'Minha Conta'
    return 'Admin'
  })()

  return (
    <div className="admin-wrapper">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col admin-sidebar"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="admin-main flex flex-col min-h-screen">
        {/* Topbar */}
        <div className="admin-topbar">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{pageTitle}</p>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
