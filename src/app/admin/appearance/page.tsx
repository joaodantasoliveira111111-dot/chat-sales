import { Palette } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AppearanceForm } from "@/components/admin/AppearanceForm";
import { getAppearanceSettings, listProducts } from "@/lib/data/store";

export default async function AppearancePage() {
  const products = await listProducts();
  const product = products[0];
  const settings = product
    ? await getAppearanceSettings(product.id)
    : {
        publicOfferName: "CapCut Pro por menos",
        publicSubtitle: "Acesso digital para quem edita videos no celular.",
        template: "dark_premium" as const,
        avatarUrl: null,
        showHeader: true,
        showTopSupport: false,
        showMicroCredibility: true,
        microCredibilityText: "Entrega digital apos pagamento • Suporte de acesso • Uso pessoal",
        primaryColor: "#00D1FF",
        secondaryColor: "#7B61FF",
        background: "#0B0F14",
        bubbleStyle: "rounded" as const,
        buttonStyle: "gradient" as const,
        font: "geist" as const,
      };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <Palette size={14} />
            Templates publicos
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Aparencia da pagina
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A9B4C3]">
            Controle a primeira dobra, template visual, cabecalho, avatar,
            microcredibilidade e preview mobile/desktop da oferta.
          </p>
        </section>
        {product ? (
          <AppearanceForm
            products={products}
            initialProductId={product.id}
            initialSettings={settings}
          />
        ) : null}
      </div>
    </AdminLayout>
  );
}
