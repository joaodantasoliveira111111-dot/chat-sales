import { notFound } from "next/navigation";
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
      <GlassCard className="mx-auto max-w-3xl p-5">
        <h1 className="mb-4 text-2xl font-bold">Editar produto</h1>
        <ProductForm product={product} />
      </GlassCard>
    </AdminLayout>
  );
}
