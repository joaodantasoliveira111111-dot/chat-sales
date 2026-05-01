"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { CheckoutCard } from "@/components/chat/CheckoutCard";
import { DeliveryCard } from "@/components/chat/DeliveryCard";
import { FAQChat } from "@/components/chat/FAQChat";
import { OfferCard } from "@/components/chat/OfferCard";
import { PixPaymentCard } from "@/components/chat/PixPaymentCard";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { ChatButtonAction, ChatStep, DeliveryPayload, Faq, Product } from "@/lib/types";

type PaymentState = {
  orderId: string;
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  status: string;
};

type ReplyMap = Record<string, string>;

export function ChatLanding({
  product,
  chatSteps,
  faqs,
}: {
  product: Product;
  chatSteps: ChatStep[];
  faqs: Faq[];
}) {
  const orderedSteps = useMemo(
    () => [...chatSteps].sort((a, b) => a.step_order - b.step_order),
    [chatSteps],
  );
  const [visibleSteps, setVisibleSteps] = useState<ChatStep[]>(() =>
    orderedSteps[0] ? [orderedSteps[0]] : [],
  );
  const [replies, setReplies] = useState<ReplyMap>({});
  const [typing, setTyping] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPayload | null>(null);
  const trackedPaidRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "server";
    const stored = window.localStorage.getItem("acessopro_session_id");
    if (stored) return stored;
    const next = crypto.randomUUID();
    window.localStorage.setItem("acessopro_session_id", next);
    return next;
  }, []);

  const currentStep = visibleSteps[visibleSteps.length - 1] ?? null;
  const canAnswer = Boolean(
    currentStep && !typing && !checkoutOpen && !faqOpen && !payment && !delivery,
  );

  const track = useCallback(
    async (eventType: "view" | "step" | "checkout" | "pix_generated" | "paid", stepId?: string) => {
      if (sessionId === "server") return;
      await fetch("/api/funnel/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          eventType,
          stepId: stepId ?? null,
        }),
      }).catch(() => undefined);
    },
    [product.id, sessionId],
  );

  useEffect(() => {
    void track("view", orderedSteps[0]?.id);
  }, [orderedSteps, track]);

  useEffect(() => {
    const step = visibleSteps[visibleSteps.length - 1];
    if (step) void track("step", step.id);
  }, [track, visibleSteps]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleSteps, replies, typing, checkoutOpen, faqOpen, payment, delivery]);

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

  useEffect(() => {
    if (!delivery || trackedPaidRef.current) return;
    trackedPaidRef.current = true;
    void track("paid");
  }, [delivery, track]);

  function handleChoice(step: ChatStep, button: "primary" | "secondary") {
    const isPrimary = button === "primary";
    const label = isPrimary ? step.primary_button_text : step.secondary_button_text;
    const action = isPrimary ? step.primary_button_action : step.secondary_button_action;
    const nextId = isPrimary ? step.next_step_id : step.secondary_step_id;
    if (!label || !action) return;

    setReplies((current) => ({ ...current, [step.id]: label }));
    runAction(step, action, nextId);
  }

  function runAction(step: ChatStep, action: ChatButtonAction, nextId?: string | null) {
    if (action === "open_checkout") {
      setFaqOpen(false);
      setCheckoutOpen(true);
      void track("checkout", step.id);
      return;
    }
    if (action === "open_faq") {
      setCheckoutOpen(false);
      setFaqOpen(true);
      return;
    }
    if (action === "support") {
      window.location.href = "mailto:suporte@acessopro.local";
      return;
    }
    showNext(step, step.delay_ms, nextId);
  }

  function showNext(step: ChatStep, delay = 650, targetStepId?: string | null) {
    const nextStep =
      orderedSteps.find((item) => item.id === targetStepId) ??
      orderedSteps.find((item) => item.id === step.next_step_id) ??
      orderedSteps.find((item) => item.step_order === step.step_order + 1);

    if (!nextStep) return;

    setTyping(true);
    window.setTimeout(() => {
      setVisibleSteps((current) =>
        current.some((item) => item.id === nextStep.id)
          ? current
          : [...current, nextStep],
      );
      setTyping(false);
    }, delay);
  }

  function openCheckout() {
    setFaqOpen(false);
    setCheckoutOpen(true);
    if (currentStep) void track("checkout", currentStep.id);
  }

  function handlePaymentCreated(nextPayment: PaymentState) {
    window.localStorage.setItem("acessopro_order_id", nextPayment.orderId);
    setPayment(nextPayment);
    setCheckoutOpen(false);
    void track("pix_generated");
  }

  function handleStatus(payload: { status: string; delivery?: DeliveryPayload }) {
    setPayment((current) =>
      current ? { ...current, status: payload.status } : current,
    );
    if (payload.delivery) setDelivery(payload.delivery);
  }

  function restart() {
    window.localStorage.removeItem("acessopro_order_id");
    setVisibleSteps(orderedSteps[0] ? [orderedSteps[0]] : []);
    setReplies({});
    setCheckoutOpen(false);
    setFaqOpen(false);
    setPayment(null);
    setDelivery(null);
    trackedPaidRef.current = false;
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B0F14] px-3 text-white sm:px-4">
      <Background />
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-cyan-200">
            <ShieldCheck size={21} />
          </div>
          <div>
            <p className="text-base font-bold">AcessoPro</p>
            <p className="text-xs text-[#A9B4C3]">Entrega digital segura</p>
          </div>
        </div>
        <a
          href="mailto:suporte@acessopro.local"
          className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-[#A9B4C3] transition hover:border-cyan-300/35 hover:text-white"
        >
          <LifeBuoy size={16} />
          Suporte
        </a>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-[780px] flex-1 items-center pb-4">
        <div className="flex max-h-[calc(100vh-120px)] min-h-[660px] w-full flex-col overflow-hidden rounded-[32px] border border-white/12 bg-[#10161E]/82 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <ChatHeader product={product} />

          <div className="chat-scroll flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(0,209,255,0.08),transparent_34%)] px-3 py-5 sm:px-5">
            <TrustStrip />
            {visibleSteps.map((step) => (
              <div key={step.id} className="space-y-3">
                {step.message_text ? (
                  <ChatMessageBubble tone="bot" author="AcessoPro">
                    {step.message_text}
                  </ChatMessageBubble>
                ) : null}
                <StepMedia step={step} />
                {step.step_order === 6 ? (
                  <div className="pl-10">
                    <OfferCard product={product} />
                  </div>
                ) : null}
                {replies[step.id] ? (
                  <ChatMessageBubble tone="user" author="Voce">
                    {replies[step.id]}
                  </ChatMessageBubble>
                ) : null}
              </div>
            ))}
            {typing ? <TypingIndicator /> : null}
            {faqOpen ? <FAQChat faqs={faqs} product={product} onBuy={openCheckout} /> : null}
            {checkoutOpen ? (
              <div className="pl-0 sm:pl-10">
                <CheckoutCard
                  product={product}
                  sessionId={sessionId}
                  onCreated={handlePaymentCreated}
                />
              </div>
            ) : null}
            {payment && !delivery ? (
              <div className="pl-0 sm:pl-10">
                <PixPaymentCard
                  {...payment}
                  sessionId={sessionId}
                  onStatus={handleStatus}
                />
              </div>
            ) : null}
            {payment?.status === "paid_pending_stock" ? (
              <ChatMessageBubble tone="system">
                Pagamento confirmado. Estamos preparando seu acesso. Nossa equipe foi
                notificada e voce recebera a entrega em breve.
              </ChatMessageBubble>
            ) : null}
            {delivery ? <DeliveryCard delivery={delivery} onRestart={restart} /> : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 bg-[#0D131A]/96 p-3 sm:p-4">
            {canAnswer && currentStep ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs text-[#A9B4C3]">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-200" />
                    Toque em uma resposta para continuar a conversa
                  </span>
                  <span>{currentStep.step_order}/{orderedSteps.length}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentStep.primary_button_text ? (
                    <ChatButton onClick={() => handleChoice(currentStep, "primary")}>
                      {currentStep.primary_button_text}
                    </ChatButton>
                  ) : null}
                  {currentStep.secondary_button_text ? (
                    <ChatButton
                      className="border-violet-300/25 from-violet-500/14 to-white/[0.04]"
                      onClick={() => handleChoice(currentStep, "secondary")}
                    >
                      {currentStep.secondary_button_text}
                    </ChatButton>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex min-h-12 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-[#A9B4C3]">
                <span>
                  {typing
                    ? "AcessoPro esta digitando..."
                    : payment
                      ? "Acompanhe o status do Pix nesta conversa."
                      : "Conversa guiada segura."}
                </span>
                <ChevronRight size={17} />
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-2 py-4 text-center text-xs text-[#A9B4C3] sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>Produto digital. Leia as condicoes de uso e entrega antes da compra.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:suporte@acessopro.local" className="hover:text-white">
            suporte
          </a>
          <a href="#" className="hover:text-white">
            termos
          </a>
          <a href="#" className="hover:text-white">
            politica de entrega
          </a>
          <a href="#" className="hover:text-white">
            reembolso
          </a>
        </div>
      </footer>
    </main>
  );
}

function ChatHeader({ product }: { product: Product }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#111922]/95 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-300/25 bg-gradient-to-br from-cyan-300/18 to-violet-500/18">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <LockKeyhole size={20} className="text-cyan-100" />
          )}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#111922] bg-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{product.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Online agora - entrega automatica
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#A9B4C3] sm:flex">
        <CheckCircle2 size={14} className="text-cyan-200" />
        Pagamento Pix seguro
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-[#A9B4C3]">
      <ShieldCheck size={14} className="text-cyan-200" />
      Conversa protegida para compra e entrega digital
    </div>
  );
}

function StepMedia({ step }: { step: ChatStep }) {
  if (!step.media_url || step.media_type === "none") return null;

  if (step.media_type === "video") {
    return (
      <div className="pl-10">
        <video
          className="max-h-[360px] w-full max-w-[520px] rounded-3xl border border-white/10 bg-black object-cover"
          src={step.media_url}
          controls
          playsInline
        />
      </div>
    );
  }

  return (
    <div className="ml-10 max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={step.media_url}
        alt={step.media_alt || "Imagem da mensagem"}
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-18%] top-[-12%] h-[420px] w-[420px] rounded-full bg-cyan-400/12 blur-[110px]" />
      <div className="absolute bottom-[8%] right-[-16%] h-[520px] w-[520px] rounded-full bg-violet-500/14 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}
