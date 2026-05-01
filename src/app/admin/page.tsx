import { AdminLayout } from "@/components/admin/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/env";
import { getAdminStats } from "@/lib/data/store";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-[#A9B4C3]">
            Visao geral do funil, pedidos e estoque digital.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total de pedidos" value={String(stats.totalOrders)} />
          <Metric label="Pedidos pagos" value={String(stats.paidOrders)} />
          <Metric label="Pedidos pendentes" value={String(stats.pendingOrders)} />
          <Metric label="Faturamento" value={formatCurrency(stats.revenue)} />
          <Metric label="Produtos ativos" value={String(stats.activeProducts)} />
          <Metric label="Disponiveis" value={String(stats.availableItems)} />
          <Metric label="Vendidos" value={String(stats.soldItems)} />
          <Metric label="Conversao basica" value={`${stats.conversionRate}%`} />
        </div>
      </div>
    </AdminLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="p-5">
      <p className="text-sm text-[#A9B4C3]">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </GlassCard>
  );
}
