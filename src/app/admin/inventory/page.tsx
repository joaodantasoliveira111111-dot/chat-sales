import { AdminLayout } from "@/components/admin/AdminLayout";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { listInventory, listProducts } from "@/lib/data/store";

export default async function InventoryPage() {
  const [products, items] = await Promise.all([listProducts(), listInventory()]);

  return (
    <AdminLayout>
      <GlassCard className="p-5">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Entregaveis / estoque</h1>
          <p className="text-sm text-[#A9B4C3]">
            Cadastre acessos autorizados, importe CSV e acompanhe entregas.
          </p>
        </div>
        <InventoryTable products={products} initialItems={items} />
      </GlassCard>
    </AdminLayout>
  );
}
