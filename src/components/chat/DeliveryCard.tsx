"use client";

import { LifeBuoy, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import type { DeliveryPayload } from "@/lib/types";

export function DeliveryCard({
  delivery,
  onRestart,
}: {
  delivery: DeliveryPayload;
  onRestart: () => void;
}) {
  return (
    <GlassCard className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Pagamento confirmado. Seu acesso foi liberado:
        </h2>
      </div>
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
        <Info label="Produto" value={delivery.product_name} />
        <Info label="E-mail" value={delivery.access_email ?? "-"} />
        <Info label="Senha" value={delivery.access_password ?? "-"} />
        {delivery.access_url ? <Info label="Link" value={delivery.access_url} /> : null}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-2 text-sm font-semibold text-white">Instruções</p>
        <p className="whitespace-pre-line text-sm leading-6 text-[#A9B4C3]">
          {delivery.instructions}
        </p>
        {delivery.extra_instructions ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-cyan-100">
            {delivery.extra_instructions}
          </p>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <a href="mailto:suporte@acessopro.local" className="w-full">
          <NeonButton type="button" variant="secondary" className="w-full">
            <LifeBuoy size={16} />
            Preciso de suporte
          </NeonButton>
        </a>
        <NeonButton type="button" onClick={onRestart}>
          <RotateCcw size={16} />
          Comprar outro acesso
        </NeonButton>
      </div>
    </GlassCard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#A9B4C3]">{label}</span>
      <span className="max-w-[58%] break-all text-right font-semibold text-white">
        {value}
      </span>
    </div>
  );
}
