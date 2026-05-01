"use client";

import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { ChatButtonAction, ChatStep, Faq, Product } from "@/lib/types";

const actions: ChatButtonAction[] = [
  "next_step",
  "open_checkout",
  "open_faq",
  "external_link",
  "support",
];

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
        <h2 className="text-lg font-semibold">Mensagens do funil</h2>
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="grid gap-3 md:grid-cols-[100px_1fr]">
              <Input
                label="Ordem"
                value={String(step.step_order)}
                onChange={(value) => patchStep(index, { step_order: Number(value) })}
              />
              <label className="grid gap-1 text-sm text-[#A9B4C3]">
                Texto
                <textarea
                  className="min-h-28 rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-white outline-none"
                  value={step.message_text}
                  onChange={(event) => patchStep(index, { message_text: event.target.value })}
                />
              </label>
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
