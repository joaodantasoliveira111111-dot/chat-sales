import { GitBranch, MessageSquareText } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ChatStepEditor } from "@/components/admin/ChatStepEditor";
import { GlassCard } from "@/components/ui/GlassCard";
import { listChatSteps, listFaqs, listProducts } from "@/lib/data/store";

export default async function ChatStepsPage() {
  const [products, chatSteps, faqs] = await Promise.all([
    listProducts(),
    listChatSteps(),
    listFaqs(),
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <GitBranch size={14} />
            Flow builder
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Fluxos de conversa por nos
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A9B4C3]">
            Monte o funil como uma automacao visual: mensagem, imagem ou video,
            botoes, logicas e destino de cada acao.
          </p>
        </section>

        <GlassCard className="p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
              <MessageSquareText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Editor operacional</h2>
              <p className="text-sm text-[#A9B4C3]">
                Selecione o produto, clique no no e configure mensagem, midia e destino.
              </p>
            </div>
          </div>
          <ChatStepEditor products={products} initialSteps={chatSteps} initialFaqs={faqs} />
        </GlassCard>
      </div>
    </AdminLayout>
  );
}
