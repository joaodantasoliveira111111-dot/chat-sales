"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, LifeBuoy, Sparkles } from "lucide-react";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { CheckoutCard } from "@/components/chat/CheckoutCard";
import { DeliveryCard } from "@/components/chat/DeliveryCard";
import { PixPaymentCard } from "@/components/chat/PixPaymentCard";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { GlassCard } from "@/components/ui/GlassCard";
import { trackClientEvent } from "@/lib/events";
import type {
  ChatStep,
  DeliveryPayload,
  Faq,
  Flow,
  FlowEdge,
  FlowNode,
  PageAppearanceSettings,
  Product,
} from "@/lib/types";

type PaymentState = {
  orderId: string;
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  status: string;
};

type VisibleMessage = {
  id: string;
  tone: "bot" | "user" | "system";
  kind: "text" | "media" | "faq";
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  faqs?: Array<{ question: string; answer: string }>;
  finalButtonText?: string;
  finalTargetNodeId?: string | null;
};

export function ChatLanding({
  product,
  chatSteps,
  flow,
  flowNodes = [],
  flowEdges = [],
  appearance,
}: {
  product: Product;
  chatSteps: ChatStep[];
  faqs: Faq[];
  flow?: Flow | null;
  flowNodes?: FlowNode[];
  flowEdges?: FlowEdge[];
  appearance?: PageAppearanceSettings;
}) {
  const settings = useMemo(
    () => ({
      publicOfferName:
        appearance?.publicOfferName || product.public_title || "CapCut Pro por menos",
      publicSubtitle:
        appearance?.publicSubtitle ||
        product.public_subtitle ||
        "Acesso digital para quem edita vídeos no celular e quer usar mais recursos sem pagar caro.",
      template: appearance?.template ?? flow?.theme_id ?? "dark_premium",
      avatarUrl: appearance?.avatarUrl ?? null,
      showHeader: appearance?.showHeader ?? true,
      showTopSupport: appearance?.showTopSupport ?? false,
      showMicroCredibility: appearance?.showMicroCredibility ?? true,
      microCredibilityText:
        appearance?.microCredibilityText ??
        "Entrega digital após pagamento • Suporte de acesso • Uso pessoal",
      primaryColor: appearance?.primaryColor ?? "#00D1FF",
      secondaryColor: appearance?.secondaryColor ?? "#7B61FF",
      background: appearance?.background ?? "#0B0F14",
      bubbleStyle: appearance?.bubbleStyle ?? "rounded",
      buttonStyle: appearance?.buttonStyle ?? "gradient",
      font: appearance?.font ?? "geist",
    }),
    [appearance, flow?.theme_id, product.public_subtitle, product.public_title],
  );
  const theme = getTemplate(settings.template);
  const nodesById = useMemo(
    () => new Map(flowNodes.map((node) => [node.id, node])),
    [flowNodes],
  );
  const edgesBySource = useMemo(() => {
    const map = new Map<string, FlowEdge[]>();
    for (const edge of flowEdges) {
      map.set(edge.source_node_id, [...(map.get(edge.source_node_id) ?? []), edge]);
    }
    return map;
  }, [flowEdges]);

  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [checkoutNode, setCheckoutNode] = useState<FlowNode | null>(null);
  const [pixNode, setPixNode] = useState<FlowNode | null>(null);
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [delivery, setDelivery] = useState<DeliveryPayload | null>(null);
  const startedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const paidTrackedRef = useRef(false);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "server";
    const stored = window.localStorage.getItem("chatfy_session_id");
    if (stored) return stored;
    const next = crypto.randomUUID();
    window.localStorage.setItem("chatfy_session_id", next);
    return next;
  }, []);

  const currentNode = currentNodeId ? nodesById.get(currentNodeId) ?? null : null;
  const currentButtons =
    currentNode?.type === "button_message" && Array.isArray(currentNode.config.buttons)
      ? (currentNode.config.buttons as Array<{
          label?: string;
          action_type?: string;
          target_node_id?: string | null;
        }>)
      : [];

  const track = useCallback(
    async (eventType: "view" | "step" | "checkout" | "pix_generated" | "paid") => {
      if (sessionId === "server") return;
      await fetch("/api/funnel/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: product.id,
          eventType,
          stepId: currentNodeId,
        }),
      }).catch(() => undefined);
    },
    [currentNodeId, product.id, sessionId],
  );

  function bootstrapLegacy() {
    const first = chatSteps[0];
    if (!first) return;
    setVisibleMessages([
      {
        id: first.id,
        tone: "bot",
        kind: "text",
        text: first.message_text,
      },
    ]);
  }

  async function runNode(nodeId: string | null | undefined) {
    if (!nodeId) return;
    const node = nodesById.get(nodeId);
    if (!node) return;
    setCurrentNodeId(node.id);
    void track("step");

    if (node.type === "start") {
      await runNode(String(node.config.next_node_id || nextFromEdge(node.id, "next")));
      return;
    }

    if (node.config.show_typing !== false && ["text_message", "button_message", "media_message"].includes(node.type)) {
      setTyping(true);
      await wait(Number(node.config.typing_duration_ms ?? node.config.delay_ms ?? 650));
      setTyping(false);
    }

    if (node.type === "text_message") {
      pushMessage({
        id: node.id,
        tone: "bot",
        kind: "text",
        text: String(node.config.message_text ?? ""),
      });
      const next = String(node.config.next_node_id || nextFromEdge(node.id, "next") || "");
      if (next) void runNode(next);
      return;
    }

    if (node.type === "button_message") {
      pushMessage({
        id: node.id,
        tone: "bot",
        kind: "text",
        text: String(node.config.message_text ?? ""),
      });
      return;
    }

    if (node.type === "media_message") {
      pushMessage({
        id: node.id,
        tone: "bot",
        kind: "media",
        text: String(node.config.caption ?? ""),
        mediaUrl: String(node.config.media_url ?? ""),
        mediaType: String(node.config.media_type ?? "image"),
      });
      const next = String(node.config.next_node_id || nextFromEdge(node.id, "next") || "");
      if (next) void runNode(next);
      return;
    }

    if (node.type === "faq") {
      pushMessage({
        id: node.id,
        tone: "bot",
        kind: "faq",
        faqs: Array.isArray(node.config.faqs)
          ? (node.config.faqs as Array<{ question: string; answer: string }>)
          : [],
        finalButtonText: String(node.config.final_button_text ?? "Comprar agora"),
        finalTargetNodeId: String(
          node.config.final_button_target_node_id || nextFromEdge(node.id, "final") || "",
        ),
      });
      return;
    }

    if (node.type === "checkout") {
      setCheckoutNode(node);
      setPixNode(null);
      trackClientEvent("InitiateCheckout", { productId: product.id, flowId: flow?.id });
      void track("checkout");
      return;
    }

    if (node.type === "pix_payment") {
      setPixNode(node);
      setCheckoutNode(null);
      return;
    }

    if (node.type === "delivery") {
      return;
    }

    if (node.type === "support") {
      const url = String(node.config.support_url ?? "mailto:suporte@chatfy.local");
      window.location.assign(url);
      return;
    }

    if (node.type === "redirect") {
      await wait(Number(node.config.delay_ms ?? 300));
      window.location.assign(String(node.config.url ?? "/"));
      return;
    }

    if (node.type === "end") {
      pushMessage({
        id: node.id,
        tone: "system",
        kind: "text",
        text: String(node.config.final_message ?? "Conversa finalizada."),
      });
    }
  }

  function pushMessage(message: VisibleMessage) {
    setVisibleMessages((current) =>
      current.some((item) => item.id === message.id) ? current : [...current, message],
    );
  }

  function nextFromEdge(nodeId: string, handle: string) {
    return edgesBySource
      .get(nodeId)
      ?.find((edge) => edge.source_handle === handle)?.target_node_id;
  }

  function handleButton(button: {
    label?: string;
    action_type?: string;
    target_node_id?: string | null;
  }, index: number) {
    const label = button.label ?? "Continuar";
    pushMessage({
      id: `${currentNodeId}-${index}-reply`,
      tone: "user",
      kind: "text",
      text: label,
    });
    trackClientEvent("ClickButton", {
      productId: product.id,
      flowId: flow?.id,
      nodeId: currentNodeId,
      label,
    });
    const action = button.action_type ?? "go_to_node";
    const target =
      button.target_node_id || nextFromEdge(currentNodeId ?? "", `button:${index}`);

    if (action === "open_checkout") {
      const checkoutTarget =
        target ??
        flowNodes.find((node) => node.type === "checkout")?.id;
      void runNode(checkoutTarget);
      return;
    }
    if (action === "open_faq") {
      const faqTarget = target ?? flowNodes.find((node) => node.type === "faq")?.id;
      void runNode(faqTarget);
      return;
    }
    if (action === "open_support") {
      window.location.assign("mailto:suporte@chatfy.local");
      return;
    }
    if (action === "external_link" && target) {
      window.location.assign(target);
      return;
    }
    void runNode(target);
  }

  function handlePaymentCreated(nextPayment: PaymentState) {
    window.localStorage.setItem("chatfy_order_id", nextPayment.orderId);
    setPayment(nextPayment);
    setCheckoutNode(null);
    trackClientEvent("GeneratePix", { productId: product.id, orderId: nextPayment.orderId });
    void track("pix_generated");
    const nextPix =
      String(checkoutNode?.config.next_node_id ?? "") ||
      nextFromEdge(checkoutNode?.id ?? "", "next") ||
      flowNodes.find((node) => node.type === "pix_payment")?.id;
    void runNode(nextPix);
  }

  function handleStatus(payload: { status: string; delivery?: DeliveryPayload }) {
    setPayment((current) =>
      current ? { ...current, status: payload.status } : current,
    );
    if (payload.delivery) {
      setDelivery(payload.delivery);
      trackClientEvent("Purchase", { productId: product.id, orderId: payment?.orderId });
      trackClientEvent("DeliveryCompleted", {
        productId: product.id,
        orderId: payment?.orderId,
      });
      const success =
        String(pixNode?.config.success_target_node_id ?? "") ||
        nextFromEdge(pixNode?.id ?? "", "success") ||
        flowNodes.find((node) => node.type === "delivery")?.id;
      if (success) setCurrentNodeId(success);
    }
  }

  function restart() {
    window.localStorage.removeItem("chatfy_order_id");
    setVisibleMessages([]);
    setCurrentNodeId(null);
    setCheckoutNode(null);
    setPixNode(null);
    setPayment(null);
    setDelivery(null);
    paidTrackedRef.current = false;
    void runNode(flow?.start_node_id ?? flowNodes[0]?.id);
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackClientEvent("PageView", { productId: product.id, flowId: flow?.id });
    trackClientEvent("StartChat", { productId: product.id, flowId: flow?.id });
    void track("view");
    const startId = flow?.start_node_id ?? flowNodes[0]?.id;
    window.setTimeout(() => {
      if (startId) {
        void runNode(startId);
      } else {
        bootstrapLegacy();
      }
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleMessages, typing, checkoutNode, pixNode, payment, delivery]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.orderId, delivery, sessionId]);

  useEffect(() => {
    if (!delivery || paidTrackedRef.current) return;
    paidTrackedRef.current = true;
    void track("paid");
  }, [delivery, track]);

  const currentPixText = pixNode
    ? String(pixNode.config.pending_text ?? "Pix gerado.")
    : "Pix gerado.";

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-3 text-white ${theme.page}`}
      style={{
        background: theme.background || settings.background,
        ["--chatfy-primary" as string]: settings.primaryColor,
        ["--chatfy-secondary" as string]: settings.secondaryColor,
      }}
    >
      <div aria-hidden className={theme.backdrop} />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col py-4 sm:py-6">
        <Hero
          product={product}
          settings={settings}
          theme={theme}
        />

        <div className="mx-auto mt-5 flex w-full max-w-[760px] flex-1 flex-col overflow-hidden rounded-[32px] border border-white/12 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,.34)] backdrop-blur-2xl">
          {settings.showHeader ? (
            <ChatHeader product={product} settings={settings} theme={theme} />
          ) : null}
          <div className={`chat-scroll flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-5 ${theme.chatArea}`}>
            {visibleMessages.map((message) =>
              message.kind === "faq" ? (
                <FaqNodeCard
                  key={message.id}
                  message={message}
                  onClick={(target) => {
                    pushMessage({
                      id: `${message.id}-reply`,
                      tone: "user",
                      kind: "text",
                      text: message.finalButtonText,
                    });
                    void runNode(target);
                  }}
                />
              ) : message.kind === "media" ? (
                <MediaBubble key={message.id} message={message} />
              ) : (
                <ChatMessageBubble
                  key={message.id}
                  tone={message.tone}
                  author={message.tone === "bot" ? product.name : message.tone === "user" ? "Você" : undefined}
                >
                  {message.text}
                </ChatMessageBubble>
              ),
            )}
            {typing ? <TypingIndicator /> : null}
            {checkoutNode ? (
              <div className="pl-0 sm:pl-10">
                <CheckoutCard
                  product={product}
                  sessionId={sessionId}
                  onCreated={handlePaymentCreated}
                />
              </div>
            ) : null}
            {pixNode && payment && !delivery ? (
              <div className="space-y-3 pl-0 sm:pl-10">
                <ChatMessageBubble tone="bot" author={product.name}>
                  {currentPixText}
                </ChatMessageBubble>
                <PixPaymentCard
                  {...payment}
                  sessionId={sessionId}
                  onStatus={handleStatus}
                />
              </div>
            ) : null}
            {payment?.status === "paid_pending_stock" ? (
              <ChatMessageBubble tone="system">
                Pagamento confirmado. Estamos preparando seu acesso. Nossa equipe foi notificada.
              </ChatMessageBubble>
            ) : null}
            {delivery ? <DeliveryCard delivery={delivery} onRestart={restart} /> : null}
            <div ref={bottomRef} />
          </div>
          <div className={`border-t border-white/10 p-3 sm:p-4 ${theme.replyBar}`}>
            {currentButtons.length && !checkoutNode && !pixNode && !delivery ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {currentButtons.map((button, index) =>
                  button.label ? (
                    <ChatButton key={`${button.label}-${index}`} onClick={() => handleButton(button, index)}>
                      {button.label}
                    </ChatButton>
                  ) : null,
                )}
              </div>
            ) : (
              <div className="flex min-h-12 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/70">
                <span>{typing ? `${product.name} está digitando...` : "Conversa segura para compra digital"}</span>
                <Sparkles size={16} />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Hero({
  product,
  settings,
  theme,
}: {
  product: Product;
  settings: PageAppearanceSettings;
  theme: ReturnType<typeof getTemplate>;
}) {
  return (
    <header className={`mx-auto w-full max-w-[760px] ${theme.hero}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--chatfy-primary)]">
            {product.name} • acesso digital
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {settings.publicOfferName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
            {settings.publicSubtitle}
          </p>
          {settings.showMicroCredibility ? (
            <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/75">
              {settings.microCredibilityText}
            </p>
          ) : null}
        </div>
        {settings.showTopSupport ? (
          <a
            href="mailto:suporte@chatfy.local"
            className="hidden min-h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold text-white/70 transition hover:text-white sm:inline-flex"
          >
            <LifeBuoy size={16} />
            Suporte
          </a>
        ) : null}
      </div>
    </header>
  );
}

function ChatHeader({
  product,
  settings,
  theme,
}: {
  product: Product;
  settings: PageAppearanceSettings;
  theme: ReturnType<typeof getTemplate>;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5 ${theme.header}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/[0.08]">
          {settings.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-black text-white">CC</span>
          )}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#111922] bg-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{product.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            online agora
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/65 sm:flex">
        <CheckCircle2 size={14} className="text-[var(--chatfy-primary)]" />
        compra simples
      </div>
    </div>
  );
}

function FaqNodeCard({
  message,
  onClick,
}: {
  message: VisibleMessage;
  onClick: (target?: string | null) => void;
}) {
  return (
    <div className="pl-0 sm:pl-10">
      <GlassCard className="space-y-3 p-4">
        <p className="text-sm font-bold text-white">Dúvidas frequentes</p>
        {message.faqs?.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm font-semibold text-white">{faq.question}</p>
            <p className="mt-1 text-sm leading-6 text-[#A9B4C3]">{faq.answer}</p>
          </div>
        ))}
        <ChatButton onClick={() => onClick(message.finalTargetNodeId)}>
          {message.finalButtonText}
        </ChatButton>
      </GlassCard>
    </div>
  );
}

function MediaBubble({ message }: { message: VisibleMessage }) {
  if (!message.mediaUrl) return null;
  return (
    <div className="pl-10">
      <div className="max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-black/30">
        {message.mediaType === "video" ? (
          <video src={message.mediaUrl} className="w-full" controls playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={message.mediaUrl} alt="" className="h-auto w-full object-cover" />
        )}
      </div>
      {message.text ? (
        <ChatMessageBubble tone="bot">{message.text}</ChatMessageBubble>
      ) : null}
    </div>
  );
}

function getTemplate(template: string) {
  const templates = {
    dark_premium: {
      background: "#0B0F14",
      page: "text-white",
      backdrop:
        "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,209,255,.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(123,97,255,.14),transparent_34%)]",
      hero: "pt-2",
      header: "bg-[#111922]/95",
      chatArea: "bg-[radial-gradient(circle_at_50%_0%,rgba(0,209,255,0.08),transparent_34%)]",
      replyBar: "bg-[#0D131A]/96",
    },
    whatsapp_inspired: {
      background: "#EAF6EF",
      page: "text-[#10231A]",
      backdrop: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#D7F2E1,transparent_42%)]",
      hero: "rounded-[28px] bg-white/65 p-5 text-[#10231A]",
      header: "bg-[#075E54]/95",
      chatArea: "bg-[#E7F4EA]",
      replyBar: "bg-white/90",
    },
    instagram_dm: {
      background: "#111018",
      page: "text-white",
      backdrop:
        "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(253,29,29,.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(131,58,180,.18),transparent_34%)]",
      hero: "pt-2",
      header: "bg-[#171320]/95",
      chatArea: "bg-[#111018]",
      replyBar: "bg-[#171320]/95",
    },
    minimal_chat: {
      background: "#101114",
      page: "text-white",
      backdrop: "pointer-events-none absolute inset-0",
      hero: "pt-2",
      header: "bg-[#15171B]/95",
      chatArea: "bg-[#101114]",
      replyBar: "bg-[#15171B]/95",
    },
  };
  return templates[template as keyof typeof templates] ?? templates.dark_premium;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
