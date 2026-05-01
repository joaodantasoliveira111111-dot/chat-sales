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
      <GlassCard className="p-5">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Mensagens do funil</h1>
          <p className="text-sm text-[#A9B4C3]">
            Edite a conversa, botoes, acoes e perguntas frequentes.
          </p>
        </div>
        <ChatStepEditor products={products} initialSteps={chatSteps} initialFaqs={faqs} />
      </GlassCard>
    </AdminLayout>
  );
}
