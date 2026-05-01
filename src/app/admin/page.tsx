import {
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  PackageCheck,
  QrCode,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/env";
import { getAdminStats } from "@/lib/data/store";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const funnel = [
    {
      label: "Entraram no funil",
      value: stats.funnelVisitors,
      icon: Users,
      tone: "text-cyan-100",
    },
    {
      label: "Geraram Pix",
      value: stats.pixGenerated,
      icon: QrCode,
      tone: "text-violet-100",
    },
    {
      label: "Pagaram",
      value: stats.paidOrders,
      icon: CheckCircle2,
      tone: "text-emerald-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <TrendingUp size={14} />
                Operacao em tempo real
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard de conversao
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A9B4C3]">
                Acompanhe visitantes do funil, Pix gerados, pagamentos, estoque
                disponivel e faturamento em uma visao feita para decisao rapida.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-[#A9B4C3]">Faturamento confirmado</p>
              <p className="mt-1 text-3xl font-black text-white">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <GlassCard className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Funil de compra</h2>
                <p className="text-sm text-[#A9B4C3]">
                  Entrada, Pix gerado e pagamento aprovado.
                </p>
              </div>
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                {stats.paidConversionRate}% Pix -&gt; Pago
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {funnel.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative rounded-3xl border border-white/10 bg-[#0D141C] p-4"
                  >
                    {index < funnel.length - 1 ? (
                      <ArrowRight
                        size={18}
                        className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-[#718094] md:block"
                      />
                    ) : null}
                    <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] ${item.tone}`}>
                      <Icon size={20} />
                    </div>
                    <p className="text-3xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-[#A9B4C3]">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h2 className="text-lg font-bold">Taxas principais</h2>
            <p className="text-sm text-[#A9B4C3]">
              Use esses numeros para ajustar copy, oferta e checkout.
            </p>
            <div className="mt-5 space-y-4">
              <Progress label="Entrada para Pix" value={stats.pixConversionRate} />
              <Progress label="Pix para pagamento" value={stats.paidConversionRate} />
              <Progress label="Conversao geral" value={stats.conversionRate} />
            </div>
          </GlassCard>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={ShoppingCart} label="Total de pedidos" value={String(stats.totalOrders)} />
          <Metric icon={MousePointerClick} label="Pedidos pendentes" value={String(stats.pendingOrders)} />
          <Metric icon={PackageCheck} label="Entregaveis disponiveis" value={String(stats.availableItems)} />
          <Metric icon={PackageCheck} label="Entregaveis vendidos" value={String(stats.soldItems)} />
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-cyan-100">
        <Icon size={18} />
      </div>
      <p className="text-sm text-[#A9B4C3]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </GlassCard>
  );
}

function Progress({ label, value }: { label: string; value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-[#A9B4C3]">{label}</span>
        <span className="font-bold text-white">{safeValue}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
