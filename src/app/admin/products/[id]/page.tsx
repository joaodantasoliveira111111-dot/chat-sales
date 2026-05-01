import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { getProductById } from "@/lib/data/store";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <AdminLayout>
      <GlassCard className="p-4 sm:p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Editar produto</h1>
            <p className="text-sm text-[#A9B4C3]">
              Ajuste oferta, entrega e preview do produto selecionado.
            </p>
          </div>
        </div>
        <ProductForm product={product} />
      </GlassCard>
    </AdminLayout>
  );
}
