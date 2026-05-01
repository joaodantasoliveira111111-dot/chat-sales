"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { CheckoutCard } from "@/components/chat/CheckoutCard";
import { DeliveryCard } from "@/components/chat/DeliveryCard";
import { FAQChat } from "@/components/chat/FAQChat";
import { OfferCard } from "@/components/chat/OfferCard";
import { PixPaymentCard } from "@/components/chat/PixPaymentCard";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ChatStep, DeliveryPayload, Faq, Product } from "@/lib/types";

type PaymentState = {
  orderId: string;
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  status: string;
};

export function ChatLanding({
  product,
  chatSteps,
  faqs,
}: {
  product: Product;
  chatSteps: ChatStep[];
  faqs: Faq[];
}) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [typing, setTyping] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPayload | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "server";
    const stored = window.localStorage.getItem("acessopro_session_id");
    if (stored) return stored;
    const next = crypto.randomUUID();
    window.localStorage.setItem("acessopro_session_id", next);
    return next;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount, typing, checkoutOpen, faqOpen, payment, delivery]);

  useEffect(() => {
    if (!payment?.orderId || delivery) return;
    const interval = window.setInterval(async () => {
      const response = await fetch(
        `/api/orders/${payment.orderId}/status?session_id=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const payload = await response.json();
      handleStatus(payload);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [payment?.orderId, delivery, sessionId]);

  function advance(step: ChatStep) {
    if (step.primary_button_action === "open_checkout") {
      setCheckoutOpen(true);
      return;
    }
    if (step.primary_button_action === "open_faq") {
      setFaqOpen(true);
      return;
    }
    showNext(step.delay_ms);
  }

  function secondary(step: ChatStep) {
    if (step.secondary_button_action === "open_faq") setFaqOpen(true);
    if (step.secondary_button_action === "open_checkout") setCheckoutOpen(true);
    if (step.secondary_button_action === "support") {
      window.location.href = "mailto:suporte@acessopro.local";
    }
  }

  function showNext(delay = 600) {
    setTyping(true);
    window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, chatSteps.length));
      setTyping(false);
    }, delay);
  }

  function openCheckout() {
    setFaqOpen(false);
    setCheckoutOpen(true);
  }

  function handlePaymentCreated(nextPayment: PaymentState) {
    window.localStorage.setItem("acessopro_order_id", nextPayment.orderId);
    setPayment(nextPayment);
    setCheckoutOpen(false);
  }

  function handleStatus(payload: { status: string; delivery?: DeliveryPayload }) {
    setPayment((current) =>
      current ? { ...current, status: payload.status } : current,
    );
    if (payload.delivery) setDelivery(payload.delivery);
  }

  function restart() {
    window.localStorage.removeItem("acessopro_order_id");
    setVisibleCount(1);
    setCheckoutOpen(false);
    setFaqOpen(false);
    setPayment(null);
    setDelivery(null);
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B0F14] px-4 text-white">
      <Background />
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-cyan-200">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-base font-bold">AcessoPro</p>
            <p className="text-xs text-[#A9B4C3]">Entrega digital segura</p>
          </div>
        </div>
        <a
          href="mailto:suporte@acessopro.local"
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm text-[#A9B4C3] transition hover:text-white"
        >
          <LifeBuoy size={16} />
          Suporte
        </a>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[720px] flex-1 items-center py-4 sm:py-8">
        <GlassCard className="flex max-h-[calc(100vh-150px)] min-h-[620px] w-full flex-col overflow-hidden p-0">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-sm font-semibold text-white">{product.name}</p>
            <p className="text-xs text-[#A9B4C3]">
              Conversa guiada para compra e entrega digital
            </p>
          </div>

          <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
            {chatSteps.slice(0, visibleCount).map((step) => (
              <div key={step.id} className="space-y-3">
                <ChatMessageBubble>{step.message_text}</ChatMessageBubble>
                {step.step_order === 6 ? <OfferCard product={product} /> : null}
                {visibleCount === step.step_order &&
                !checkoutOpen &&
                !faqOpen &&
                !payment &&
                !delivery ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {step.primary_button_text ? (
                      <ChatButton onClick={() => advance(step)}>
                        {step.primary_button_text}
                      </ChatButton>
                    ) : null}
                    {step.secondary_button_text ? (
                      <ChatButton onClick={() => secondary(step)}>
                        {step.secondary_button_text}
                      </ChatButton>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            {typing ? <TypingIndicator /> : null}
            {faqOpen ? <FAQChat faqs={faqs} product={product} onBuy={openCheckout} /> : null}
            {checkoutOpen ? (
              <CheckoutCard
                product={product}
                sessionId={sessionId}
                onCreated={handlePaymentCreated}
              />
            ) : null}
            {payment && !delivery ? (
              <PixPaymentCard
                {...payment}
                sessionId={sessionId}
                onStatus={handleStatus}
              />
            ) : null}
            {payment?.status === "paid_pending_stock" ? (
              <ChatMessageBubble tone="system">
                Pagamento confirmado. Estamos preparando seu acesso. Nossa equipe foi
                notificada e você receberá a entrega em breve.
              </ChatMessageBubble>
            ) : null}
            {delivery ? <DeliveryCard delivery={delivery} onRestart={restart} /> : null}
            <div ref={bottomRef} />
          </div>
        </GlassCard>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-2 py-5 text-center text-xs text-[#A9B4C3] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>Produto digital. Leia as condições de uso e entrega antes da compra.</p>
        <div className="flex justify-center gap-4">
          <a href="mailto:suporte@acessopro.local" className="hover:text-white">
            suporte
          </a>
          <a href="#" className="hover:text-white">
            termos
          </a>
          <a href="#" className="hover:text-white">
            política de entrega
          </a>
          <a href="#" className="hover:text-white">
            reembolso
          </a>
        </div>
      </footer>
    </main>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-18%] top-[-12%] h-[420px] w-[420px] rounded-full bg-cyan-400/12 blur-[110px]" />
      <div className="absolute bottom-[8%] right-[-16%] h-[520px] w-[520px] rounded-full bg-violet-500/14 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}
