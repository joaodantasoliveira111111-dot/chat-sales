import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { getAdminUser } from "@/lib/supabase/server";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/chat-steps", label: "Mensagens", icon: MessageSquareText },
  { href: "/admin/inventory", label: "Estoque", icon: Boxes },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/settings/payments", label: "Pagamentos", icon: CreditCard },
];

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-white/10 bg-white/[0.035] p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <Settings size={19} />
            </div>
            <div>
              <p className="font-bold">AcessoPro</p>
              <p className="text-xs text-[#A9B4C3]">{user.email}</p>
            </div>
          </div>
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm text-[#A9B4C3] transition hover:bg-white/[0.07] hover:text-white"
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="flex-1 p-4 sm:p-6">{children}</section>
      </div>
    </div>
  );
}
