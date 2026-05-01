import Link from "next/link";
import { ArrowUpRight, PackagePlus, Power, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/env";
import { listProducts } from "@/lib/data/store";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <PackagePlus size={14} />
                Catalogo comercial
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight">Produtos</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A9B4C3]">
                Crie ofertas digitais com preco, entrega e instrucoes. Depois ligue
                cada produto ao seu fluxo de conversa.
              </p>
            </div>
            <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-[#0D141C] px-4 text-sm text-[#A9B4C3]">
              <Search size={16} />
              {products.length} produto(s) cadastrado(s)
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Produtos existentes</h2>
            <div className="grid gap-3">
              {products.map((product) => (
                <Link key={product.id} href={`/admin/products/${product.id}`}>
                  <GlassCard className="group p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.07]">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <PackagePlus size={22} className="text-cyan-100" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-bold text-white">{product.name}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              product.is_active
                                ? "bg-emerald-300/12 text-emerald-100"
                                : "bg-white/[0.06] text-[#A9B4C3]"
                            }`}
                          >
                            {product.is_active ? "ativo" : "inativo"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-[#A9B4C3]">/{product.slug}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white">{formatCurrency(product.price)}</p>
                        <ArrowUpRight
                          size={16}
                          className="ml-auto mt-2 text-[#718094] transition group-hover:text-cyan-100"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
              {!products.length ? (
                <GlassCard className="p-5 text-sm text-[#A9B4C3]">
                  Nenhum produto cadastrado ainda.
                </GlassCard>
              ) : null}
            </div>
          </section>

          <GlassCard className="p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Novo produto</h2>
                <p className="text-sm text-[#A9B4C3]">
                  Formulario guiado com preview para evitar oferta incompleta.
                </p>
              </div>
              <Power size={18} className="text-cyan-100" />
            </div>
            <ProductForm />
          </GlassCard>
        </div>
      </div>
    </AdminLayout>
  );
}
