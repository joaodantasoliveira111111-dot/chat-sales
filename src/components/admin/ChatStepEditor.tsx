"use client";

import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type {
  ChatButtonAction,
  ChatMediaType,
  ChatStep,
  Faq,
  Product,
} from "@/lib/types";

const actions: ChatButtonAction[] = [
  "next_step",
  "open_checkout",
  "open_faq",
  "external_link",
  "support",
];

const mediaTypes: ChatMediaType[] = ["none", "image", "video"];

export function ChatStepEditor({
  products,
  initialSteps,
  initialFaqs,
}: {
  products: Product[];
  initialSteps: ChatStep[];
  initialFaqs: Faq[];
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [message, setMessage] = useState("");
  const defaultProductId = products[0]?.id ?? "";

  async function saveStep(step: ChatStep) {
    const response = await fetch("/api/admin/chat-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(step),
    });
    setMessage(response.ok ? "Mensagem salva." : "Erro ao salvar mensagem.");
  }

  async function saveFaq(faq: Faq) {
    const response = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
    setMessage(response.ok ? "FAQ salvo." : "Erro ao salvar FAQ.");
  }

  function patchStep(index: number, patch: Partial<ChatStep>) {
    setSteps((current) =>
      current.map((step, itemIndex) =>
        itemIndex === index ? { ...step, ...patch } : step,
      ),
    );
  }

  function patchFaq(index: number, patch: Partial<Faq>) {
    setFaqs((current) =>
      current.map((faq, itemIndex) => (itemIndex === index ? { ...faq, ...patch } : faq)),
    );
  }

  return (
    <div className="space-y-8">
      {message ? <p className="rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{message}</p> : null}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Fluxo visual</h2>
          <p className="text-sm text-[#A9B4C3]">
            Organize os nós como no n8n: cada mensagem pode ligar o botão principal
            e secundário a outro nó.
          </p>
        </div>
        <FlowCanvas steps={steps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Configuração dos nós</h2>
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="grid gap-3 md:grid-cols-[100px_160px_160px_1fr]">
              <Input
                label="Ordem"
                value={String(step.step_order)}
                onChange={(value) => patchStep(index, { step_order: Number(value) })}
              />
              <Input
                label="Posição X"
                value={String(step.position_x ?? 80)}
                onChange={(value) => patchStep(index, { position_x: Number(value) })}
              />
              <Input
                label="Posição Y"
                value={String(step.position_y ?? 80)}
                onChange={(value) => patchStep(index, { position_y: Number(value) })}
              />
              <label className="grid gap-1 text-sm text-[#A9B4C3]">
                Texto da mensagem (opcional)
                <textarea
                  className="min-h-28 rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-white outline-none"
                  value={step.message_text}
                  onChange={(event) => patchStep(index, { message_text: event.target.value })}
                />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <MediaSelect
                label="Mídia"
                value={step.media_type ?? "none"}
                onChange={(value) => patchStep(index, { media_type: value })}
              />
              <Input
                label="URL da imagem/vídeo"
                value={step.media_url ?? ""}
                onChange={(value) =>
                  patchStep(index, {
                    media_url: value || null,
                    media_type: value ? step.media_type || "image" : "none",
                  })
                }
              />
              <Input
                label="Descrição da mídia"
                value={step.media_alt ?? ""}
                onChange={(value) => patchStep(index, { media_alt: value || null })}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <Input
                label="Botao principal"
                value={step.primary_button_text ?? ""}
                onChange={(value) => patchStep(index, { primary_button_text: value })}
              />
              <Select
                label="Acao principal"
                value={step.primary_button_action}
                onChange={(value) => patchStep(index, { primary_button_action: value })}
              />
              <Input
                label="Botao secundario"
                value={step.secondary_button_text ?? ""}
                onChange={(value) => patchStep(index, { secondary_button_text: value || null })}
              />
              <Select
                label="Acao secundaria"
                value={step.secondary_button_action ?? "next_step"}
                onChange={(value) => patchStep(index, { secondary_button_action: value })}
              />
              <StepSelect
                label="Nó ligado ao botão principal"
                value={step.next_step_id ?? ""}
                steps={steps}
                currentId={step.id}
                onChange={(value) => patchStep(index, { next_step_id: value || null })}
              />
              <StepSelect
                label="Nó ligado ao botão secundário"
                value={step.secondary_step_id ?? ""}
                steps={steps}
                currentId={step.id}
                onChange={(value) =>
                  patchStep(index, { secondary_step_id: value || null })
                }
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-[#A9B4C3]">
                <input
                  type="checkbox"
                  checked={step.is_active}
                  onChange={(event) => patchStep(index, { is_active: event.target.checked })}
                />
                Ativa
              </label>
              <NeonButton type="button" onClick={() => saveStep(step)}>
                Salvar
              </NeonButton>
            </div>
          </div>
        ))}
        <NeonButton
          type="button"
          variant="secondary"
          onClick={() =>
            setSteps((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                product_id: defaultProductId,
                step_order: current.length + 1,
                message_text: "",
                media_type: "none",
                media_url: null,
                media_alt: null,
                node_id: `node-${current.length + 1}`,
                position_x: 80 + current.length * 300,
                position_y: 280,
                next_step_id: null,
                secondary_step_id: null,
                primary_button_text: "Continuar",
                primary_button_action: "next_step",
                secondary_button_text: null,
                secondary_button_action: null,
                delay_ms: 600,
                is_active: true,
              },
            ])
          }
        >
          Adicionar mensagem
        </NeonButton>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">FAQ</h2>
        {faqs.map((faq, index) => (
          <div key={faq.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="grid gap-3 md:grid-cols-[100px_1fr]">
              <Input
                label="Ordem"
                value={String(faq.order)}
                onChange={(value) => patchFaq(index, { order: Number(value) })}
              />
              <Input
                label="Pergunta"
                value={faq.question}
                onChange={(value) => patchFaq(index, { question: value })}
              />
            </div>
            <label className="mt-3 grid gap-1 text-sm text-[#A9B4C3]">
              Resposta
              <textarea
                className="min-h-24 rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-white outline-none"
                value={faq.answer}
                onChange={(event) => patchFaq(index, { answer: event.target.value })}
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-[#A9B4C3]">
                <input
                  type="checkbox"
                  checked={faq.is_active}
                  onChange={(event) => patchFaq(index, { is_active: event.target.checked })}
                />
                Ativo
              </label>
              <NeonButton type="button" onClick={() => saveFaq(faq)}>
                Salvar FAQ
              </NeonButton>
            </div>
          </div>
        ))}
        <NeonButton
          type="button"
          variant="secondary"
          onClick={() =>
            setFaqs((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                product_id: defaultProductId,
                question: "",
                answer: "",
                order: current.length + 1,
                is_active: true,
              },
            ])
          }
        >
          Adicionar FAQ
        </NeonButton>
      </section>
    </div>
  );
}

function FlowCanvas({ steps }: { steps: ChatStep[] }) {
  const width = Math.max(
    1200,
    ...steps.map((step) => Number(step.position_x ?? 80) + 280),
  );
  const height = Math.max(
    520,
    ...steps.map((step) => Number(step.position_y ?? 80) + 190),
  );
  const byId = new Map(steps.map((step) => [step.id, step]));

  return (
    <div className="overflow-auto rounded-3xl border border-white/10 bg-[#070A0F]">
      <div
        className="relative bg-[radial-gradient(circle,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:24px_24px]"
        style={{ width, height }}
      >
        <svg className="absolute inset-0 h-full w-full">
          {steps.flatMap((step) => {
            const links = [
              { id: step.next_step_id, color: "#00D1FF" },
              { id: step.secondary_step_id, color: "#7B61FF" },
            ];
            return links
              .filter((link) => link.id && byId.has(link.id))
              .map((link) => {
                const target = byId.get(link.id!)!;
                const x1 = Number(step.position_x ?? 80) + 260;
                const y1 = Number(step.position_y ?? 80) + 70;
                const x2 = Number(target.position_x ?? 80);
                const y2 = Number(target.position_y ?? 80) + 70;
                const mid = x1 + Math.max(80, (x2 - x1) / 2);
                return (
                  <path
                    key={`${step.id}-${link.id}-${link.color}`}
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={link.color}
                    strokeOpacity="0.75"
                    strokeWidth="2"
                  />
                );
              });
          })}
        </svg>
        {steps.map((step) => (
          <div
            key={step.id}
            className="absolute w-[260px] rounded-3xl border border-white/12 bg-[#101720]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,.35)]"
            style={{
              left: Number(step.position_x ?? 80),
              top: Number(step.position_y ?? 80),
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                Nó {step.step_order}
              </span>
              <span className="text-xs text-[#A9B4C3]">{step.media_type ?? "none"}</span>
            </div>
            <p className="line-clamp-3 text-sm font-medium text-white">
              {step.message_text || "Somente mídia / nó sem texto"}
            </p>
            <div className="mt-3 grid gap-1 text-xs text-[#A9B4C3]">
              <span>Principal: {step.primary_button_text || "-"}</span>
              <span>Secundário: {step.secondary_button_text || "-"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#A9B4C3]">
      {label}
      <input
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ChatButtonAction;
  onChange: (value: ChatButtonAction) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#A9B4C3]">
      {label}
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value as ChatButtonAction)}
      >
        {actions.map((action) => (
          <option key={action} value={action}>
            {action}
          </option>
        ))}
      </select>
    </label>
  );
}

function MediaSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ChatMediaType;
  onChange: (value: ChatMediaType) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#A9B4C3]">
      {label}
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value as ChatMediaType)}
      >
        {mediaTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </label>
  );
}

function StepSelect({
  label,
  value,
  steps,
  currentId,
  onChange,
}: {
  label: string;
  value: string;
  steps: ChatStep[];
  currentId: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#A9B4C3]">
      {label}
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Próximo pela ordem</option>
        {steps
          .filter((step) => step.id !== currentId)
          .map((step) => (
            <option key={step.id} value={step.id}>
              Nó {step.step_order} - {(step.message_text || "sem texto").slice(0, 42)}
            </option>
          ))}
      </select>
    </label>
  );
}
