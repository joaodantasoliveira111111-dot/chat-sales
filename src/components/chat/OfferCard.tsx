import { ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/env";
import type { Product } from "@/lib/types";

export function OfferCard({ product }: { product: Product }) {
  return (
    <GlassCard className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{product.name}</p>
          <p className="text-xs text-[#A9B4C3]">Entrega digital apos confirmacao</p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[#A9B4C3]">Hoje por</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(product.price)}</p>
      </div>
    </GlassCard>
  );
}
