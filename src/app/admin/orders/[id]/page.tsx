import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { getOrder, getOrderDelivery } from "@/lib/data/store";
import { formatCurrency } from "@/lib/env";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const delivery = await getOrderDelivery(id);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <GlassCard className="p-5">
          <h1 className="text-2xl font-bold">Pedido</h1>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <Info label="ID" value={order.id} />
            <Info label="Produto" value={order.products?.name ?? order.product_id} />
            <Info label="Cliente" value={order.customer_name} />
            <Info label="E-mail" value={order.customer_email} />
            <Info label="WhatsApp" value={order.customer_whatsapp ?? "-"} />
            <Info label="Valor" value={formatCurrency(order.amount)} />
            <Info label="Status" value={order.status} />
            <Info label="Gateway payment ID" value={order.gateway_payment_id ?? "-"} />
            <Info label="Criado em" value={order.created_at ?? "-"} />
            <Info label="Pago em" value={order.paid_at ?? "-"} />
            <Info label="Entregue em" value={order.delivered_at ?? "-"} />
            <Info label="Item entregue" value={order.delivered_item_id ?? "-"} />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Pix copia e cola</h2>
          <p className="break-all rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-[#A9B4C3]">
            {order.pix_code ?? "-"}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Entrega</h2>
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-[#A9B4C3]">
            {JSON.stringify(delivery ?? {}, null, 2)}
          </pre>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-[#A9B4C3]">{label}</p>
      <p className="mt-1 break-all font-medium text-white">{value}</p>
    </div>
  );
}
