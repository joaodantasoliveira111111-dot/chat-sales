import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/env";
import { listProducts } from "@/lib/data/store";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <AdminLayout>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <div className="grid gap-3">
            {products.map((product) => (
              <Link key={product.id} href={`/admin/products/${product.id}`}>
                <GlassCard className="p-4 transition hover:border-cyan-300/35">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-[#A9B4C3]">{product.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-[#A9B4C3]">
                        {product.is_active ? "ativo" : "inativo"}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
        <GlassCard className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Novo produto</h2>
          <ProductForm />
        </GlassCard>
      </div>
    </AdminLayout>
  );
}
