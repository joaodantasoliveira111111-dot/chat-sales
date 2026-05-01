import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderTable } from "@/components/admin/OrderTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { listOrders } from "@/lib/data/store";

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <AdminLayout>
      <GlassCard className="p-5">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-[#A9B4C3]">
            Acompanhe status, Pix, entrega e simule pagamento em modo mock.
          </p>
        </div>
        <OrderTable initialOrders={orders} />
      </GlassCard>
    </AdminLayout>
  );
}
