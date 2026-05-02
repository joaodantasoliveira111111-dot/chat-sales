import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Boxes,
  CreditCard,
  Palette,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { getAdminUser } from "@/lib/supabase/server";

const navItems = [
  { href: "/admin", label: "Dashboard", helper: "metricas e operacao", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", helper: "ofertas e precos", icon: Package },
  { href: "/admin/flows", label: "Flows", helper: "Typebot/n8n visual", icon: MessageSquareText },
  { href: "/admin/appearance", label: "Aparencia", helper: "templates e pagina", icon: Palette },
  { href: "/admin/inventory", label: "Estoque", helper: "entregaveis digitais", icon: Boxes },
  { href: "/admin/orders", label: "Pedidos", helper: "pagamentos e entrega", icon: ShoppingCart },
  { href: "/admin/settings/payments", label: "Gateways", helper: "Pix e credenciais", icon: CreditCard },
];

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#070B10] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,209,255,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(123,97,255,.12),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="sticky top-0 z-20 border-b border-white/10 bg-[#0B1118]/92 backdrop-blur-2xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 p-4 lg:block lg:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_18px_45px_rgba(0,209,255,.08)]">
                <Settings size={20} />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Chatfy</p>
                <p className="text-xs text-[#A9B4C3]">Painel de controle</p>
              </div>
            </div>
            <div className="mt-0 hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 lg:mt-6 lg:block">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles size={15} className="text-cyan-200" />
                Operacao digital
              </div>
              <p className="text-xs leading-5 text-[#A9B4C3]">
                Crie paginas de venda conversacionais com Pix e entrega automatica.
              </p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:overflow-visible lg:px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-w-[150px] items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm text-[#A9B4C3] transition hover:border-white/10 hover:bg-white/[0.06] hover:text-white lg:min-w-0"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-cyan-100 transition group-hover:bg-cyan-300/12">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.label}</span>
                    <span className="hidden truncate text-xs text-[#718094] lg:block">
                      {item.helper}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden p-4 lg:block">
            <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
              <p className="text-xs uppercase text-[#718094]">Logado como</p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{user.email}</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
