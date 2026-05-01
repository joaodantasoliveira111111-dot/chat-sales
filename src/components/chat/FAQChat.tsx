"use client";

import { ChatButton } from "@/components/chat/ChatButton";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Faq, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/env";

export function FAQChat({
  faqs,
  product,
  onBuy,
}: {
  faqs: Faq[];
  product: Product;
  onBuy: () => void;
}) {
  return (
    <GlassCard className="space-y-3 p-4">
      {faqs.map((faq) => (
        <div key={faq.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm font-semibold text-white">{faq.question}</p>
          <p className="mt-1 text-sm leading-6 text-[#A9B4C3]">{faq.answer}</p>
        </div>
      ))}
      <ChatButton className="w-full text-center" onClick={onBuy}>
        Comprar CapCut Pro por {formatCurrency(product.price)}
      </ChatButton>
    </GlassCard>
  );
}
