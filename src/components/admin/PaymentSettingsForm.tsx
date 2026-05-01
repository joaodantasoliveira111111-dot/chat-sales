import { GlassCard } from "@/components/ui/GlassCard";

export function PaymentSettingsForm() {
  const envs = [
    "PAYMENT_PROVIDER",
    "PAYMENT_API_URL",
    "PAYMENT_API_KEY",
    "PAYMENT_SECRET",
    "WEBHOOK_SECRET",
    "PAYMENT_WEBHOOK_URL",
  ];

  return (
    <GlassCard className="space-y-5 p-5">
      <div>
        <h2 className="text-lg font-semibold">Gateway Pix</h2>
        <p className="text-sm text-[#A9B4C3]">
          O MVP roda com mock. Para gateway real, configure as variaveis abaixo
          na Vercel e adapte o mapeamento em src/lib/payment/paymentProvider.ts.
        </p>
      </div>
      <div className="grid gap-3">
        {envs.map((env) => (
          <div
            key={env}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3"
          >
            <code className="text-sm text-white">{env}</code>
            <span className="text-xs text-[#A9B4C3]">
              {process.env[env] ? "configurado" : "pendente"}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
