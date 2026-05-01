import { CreditCard } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            <CreditCard size={14} />
            Gateways Pix
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Configuracao de pagamentos
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A9B4C3]">
            Selecione Mock, PushinPay ou AmploPay. O gateway ativo e o unico usado
            para gerar novas cobrancas Pix no checkout.
          </p>
        </section>
        <PaymentSettingsForm />
      </div>
    </AdminLayout>
  );
}
