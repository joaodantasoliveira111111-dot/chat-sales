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
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ChatfyLogo } from '@/components/ui/ChatfyLogo'

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
      { label: 'Rastreamento', href: '/admin/settings/tracking', icon: BarChart3 },
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
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <ChatfyLogo size="md" />
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label} className="sidebar-nav-group">
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
                  <span className="sidebar-nav-icon">
                    <item.icon size={18} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={16} className="text-primary-600" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Operação segura</p>
              <p className="text-xs text-green-700">Ambiente protegido</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
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
    if (pathname.startsWith('/admin/settings/tracking')) return 'Rastreamento'
    if (pathname.startsWith('/admin/settings/account')) return 'Minha Conta'
    return 'Admin'
  })()

  const pageDescription = (() => {
    if (pathname === '/admin') return 'Acompanhe vendas, entregas e configuração da operação.'
    if (pathname.startsWith('/admin/products')) return 'Organize produtos, preços e status de venda.'
    if (pathname.startsWith('/admin/pages')) return 'Publique experiências conversacionais para seus produtos.'
    if (pathname.startsWith('/admin/flows')) return 'Construa jornadas automatizadas de atendimento e venda.'
    if (pathname.startsWith('/admin/inventory')) return 'Controle entregáveis digitais e disponibilidade.'
    if (pathname.startsWith('/admin/orders')) return 'Monitore pedidos, pagamentos e entregas.'
    if (pathname.startsWith('/admin/support')) return 'Acompanhe chamados e contatos de clientes.'
    if (pathname.startsWith('/admin/settings')) return 'Configure sua conta, pagamentos e preferências.'
    return 'Gerencie sua operação.'
  })()

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 admin-sidebar"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <span>Chatfy</span>
                <ChevronRight size={14} />
                <span className="font-medium">{pageTitle}</span>
              </div>
              
              <h1 className="page-header-title">{pageTitle}</h1>
              
              <p className="page-header-description">{pageDescription}</p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}