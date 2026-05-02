import { notFound } from "next/navigation";
import { GitBranch } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { FlowBuilder } from "@/components/admin/FlowBuilder";
import { getFlowBundle, listProducts } from "@/lib/data/store";

export default async function FlowDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bundle, products] = await Promise.all([getFlowBundle(id), listProducts()]);
  if (!bundle) notFound();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <GitBranch size={14} />
            Editor visual
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            {bundle.flow.name}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A9B4C3]">
            Arraste blocos, conecte saidas, configure mensagens, checkout, Pix,
            FAQ e entrega. Salve como rascunho ou publique.
          </p>
        </section>
        <FlowBuilder
          products={products}
          initialFlow={bundle.flow}
          initialNodes={bundle.nodes}
          initialEdges={bundle.edges}
        />
      </div>
    </AdminLayout>
  );
}
