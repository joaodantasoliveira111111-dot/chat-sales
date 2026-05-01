"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatCurrency } from "@/lib/env";
import type { DeliveryPayload } from "@/lib/types";

type PixPaymentCardProps = {
  orderId: string;
  sessionId: string;
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  status: string;
  onStatus: (payload: { status: string; delivery?: DeliveryPayload }) => void;
};

export function PixPaymentCard({
  orderId,
  sessionId,
  pixCode,
  qrCodeUrl,
  amount,
  status,
  onStatus,
}: PixPaymentCardProps) {
  async function checkStatus() {
    const response = await fetch(
      `/api/orders/${orderId}/status?session_id=${encodeURIComponent(sessionId)}`,
      { cache: "no-store" },
    );
    const payload = await response.json();
    if (response.ok) onStatus(payload);
  }

  async function copyPix() {
    await navigator.clipboard.writeText(pixCode);
  }

  return (
    <GlassCard className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Pix gerado</h2>
        <p className="mt-1 text-sm leading-6 text-[#A9B4C3]">
          Copie o código Pix abaixo ou escaneie o QR Code. Assim que o pagamento
          for confirmado, seu acesso será liberado automaticamente aqui nesta conversa.
        </p>
      </div>
      <div className="grid place-items-center rounded-3xl border border-white/10 bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrCodeUrl}
          alt="QR Code Pix"
          className="h-[220px] w-[220px]"
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs text-[#A9B4C3]">Código Pix copia e cola</p>
        <p className="mt-2 break-all font-mono text-xs leading-5 text-white/90">
          {pixCode}
        </p>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm">
        <span className="text-[#A9B4C3]">Valor</span>
        <strong className="text-white">{formatCurrency(amount)}</strong>
      </div>
      <div className="flex items-center gap-2 text-sm text-cyan-100">
        <CheckCircle2 size={16} />
        <span>Status: {status === "pending" ? "Aguardando pagamento..." : status}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <NeonButton type="button" variant="secondary" onClick={copyPix}>
          <Copy size={16} />
          Copiar código Pix
        </NeonButton>
        <NeonButton type="button" onClick={checkStatus}>
          Já paguei
        </NeonButton>
      </div>
    </GlassCard>
  );
}
