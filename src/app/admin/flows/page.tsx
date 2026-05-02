import Link from "next/link";
import { ArrowUpRight, GitBranch, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { listFlows, listProducts, saveFlow } from "@/lib/data/store";

export default async function FlowsPage() {
  const [flows, products] = await Promise.all([listFlows(), listProducts()]);

  async function createFlow() {
    "use server";
    const product = (await listProducts())[0];
    if (!product) return;
    await saveFlow({
      name: "Novo funil",
      slug: `funil-${Date.now()}`,
      product_id: product.id,
      theme_id: "dark_premium",
      status: "draft",
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <GitBranch size={14} />
            Chatfy Flow Builder
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Fluxos visuais de venda
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A9B4C3]">
            Crie funis estilo Typebot/n8n com blocos conectados, status de
            publicacao, checkout Pix e entrega automatica.
          </p>
        </section>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Fluxos</h2>
            <p className="text-sm text-[#A9B4C3]">
              {flows.length} fluxo(s) para {products.length} produto(s).
            </p>
          </div>
          <form action={createFlow}>
            <NeonButton>
              <Plus size={16} />
              Novo fluxo
            </NeonButton>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {flows.map((flow) => (
            <Link key={flow.id} href={`/admin/flows/${flow.id}`}>
              <GlassCard className="group p-5 transition hover:border-cyan-300/35 hover:bg-white/[0.07]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">{flow.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          flow.status === "published"
                            ? "bg-emerald-300/12 text-emerald-100"
                            : "bg-white/[0.06] text-[#A9B4C3]"
                        }`}
                      >
                        {flow.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#A9B4C3]">/{flow.slug}</p>
                    <p className="mt-3 text-sm text-[#A9B4C3]">
                      Produto: {flow.products?.name ?? flow.product_id}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-[#718094] transition group-hover:text-cyan-100"
                  />
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
