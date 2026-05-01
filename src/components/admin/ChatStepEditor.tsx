"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgePlus,
  Bot,
  Check,
  GitBranch,
  MessageSquareText,
  MousePointerClick,
  Save,
} from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import type {
  ChatButtonAction,
  ChatMediaType,
  ChatStep,
  Faq,
  Product,
} from "@/lib/types";

const actions: Array<{ value: ChatButtonAction; label: string; helper: string }> = [
  { value: "next_step", label: "Ir para outro no", helper: "Continua o fluxo pelo destino escolhido" },
  { value: "open_checkout", label: "Abrir checkout", helper: "Mostra o formulario e gera Pix" },
  { value: "open_faq", label: "Abrir FAQ", helper: "Mostra as perguntas dentro do chat" },
  { value: "external_link", label: "Link externo", helper: "Reservado para URL externa" },
  { value: "support", label: "Suporte", helper: "Leva para contato de suporte" },
];

const mediaTypes: Array<{ value: ChatMediaType; label: string }> = [
  { value: "none", label: "Sem midia" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Video" },
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
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const productSteps = useMemo(
    () =>
      steps
        .filter((step) => step.product_id === selectedProductId)
        .sort((a, b) => a.step_order - b.step_order),
    [selectedProductId, steps],
  );
  const productFaqs = useMemo(
    () =>
      faqs
        .filter((faq) => faq.product_id === selectedProductId)
        .sort((a, b) => a.order - b.order),
    [faqs, selectedProductId],
  );
  const [selectedStepId, setSelectedStepId] = useState(productSteps[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedStep =
    productSteps.find((step) => step.id === selectedStepId) ?? productSteps[0] ?? null;
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  function selectProduct(productId: string) {
    setSelectedProductId(productId);
    const first = steps
      .filter((step) => step.product_id === productId)
      .sort((a, b) => a.step_order - b.step_order)[0];
    setSelectedStepId(first?.id ?? "");
  }

  async function saveStep(step: ChatStep) {
    const response = await fetch("/api/admin/chat-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(step),
    });
    return response.ok;
  }

  async function saveFaq(faq: Faq) {
    const response = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
    return response.ok;
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");
    const stepResults = await Promise.all(productSteps.map((step) => saveStep(step)));
    const faqResults = await Promise.all(productFaqs.map((faq) => saveFaq(faq)));
    setSaving(false);
    setMessage(
      [...stepResults, ...faqResults].every(Boolean)
        ? "Fluxo salvo com sucesso."
        : "Alguns itens nao foram salvos. Revise os campos.",
    );
  }

  function patchStep(id: string, patch: Partial<ChatStep>) {
    setSteps((current) =>
      current.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    );
  }

  function patchFaq(id: string, patch: Partial<Faq>) {
    setFaqs((current) =>
      current.map((faq) => (faq.id === id ? { ...faq, ...patch } : faq)),
    );
  }

  function addStep() {
    const order = productSteps.length + 1;
    const step: ChatStep = {
      id: crypto.randomUUID(),
      product_id: selectedProductId,
      step_order: order,
      message_text: "",
      media_type: "none",
      media_url: null,
      media_alt: null,
      node_id: `node-${order}`,
      position_x: 80 + ((order - 1) % 3) * 330,
      position_y: 90 + Math.floor((order - 1) / 3) * 250,
      next_step_id: null,
      secondary_step_id: null,
      primary_button_text: "Continuar",
      primary_button_action: "next_step",
      secondary_button_text: null,
      secondary_button_action: null,
      delay_ms: 650,
      is_active: true,
    };
    setSteps((current) => [...current, step]);
    setSelectedStepId(step.id);
  }

  function addFaq() {
    const faq: Faq = {
      id: crypto.randomUUID(),
      product_id: selectedProductId,
      question: "",
      answer: "",
      order: productFaqs.length + 1,
      is_active: true,
    };
    setFaqs((current) => [...current, faq]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Construtor de conversa</h2>
          <p className="text-sm leading-6 text-[#A9B4C3]">
            Cada no representa uma mensagem, midia ou acao. Conecte os botoes ao
            proximo no e salve o fluxo do produto.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              className={`rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                selectedProductId === product.id
                  ? "border-cyan-300/55 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-white/[0.04] text-[#A9B4C3] hover:text-white"
              }`}
              onClick={() => selectProduct(product.id)}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
          {message}
        </p>
      ) : null}

      <div className="grid gap-5 2xl:grid-cols-[1fr_460px]">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#070B10]">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-white">Mapa do funil</p>
              <p className="text-sm text-[#A9B4C3]">
                Clique em um no para editar. As linhas mostram para onde cada botao leva.
              </p>
            </div>
            <div className="flex gap-2">
              <NeonButton type="button" variant="secondary" onClick={addStep}>
                <BadgePlus size={17} />
                Novo no
              </NeonButton>
              <NeonButton type="button" onClick={saveAll} disabled={saving}>
                <Save size={17} />
                {saving ? "Salvando..." : "Salvar fluxo"}
              </NeonButton>
            </div>
          </div>
          <FlowCanvas
            steps={productSteps}
            selectedStepId={selectedStep?.id}
            onSelect={setSelectedStepId}
          />
        </section>

        <aside className="space-y-5">
          <NodeEditor
            step={selectedStep}
            steps={productSteps}
            productName={selectedProduct?.name ?? "Produto"}
            onPatch={patchStep}
          />
          <FaqEditor faqs={productFaqs} onPatch={patchFaq} onAdd={addFaq} />
        </aside>
      </div>
    </div>
  );
}

function FlowCanvas({
  steps,
  selectedStepId,
  onSelect,
}: {
  steps: ChatStep[];
  selectedStepId?: string;
  onSelect: (id: string) => void;
}) {
  const width = Math.max(
    1180,
    ...steps.map((step) => Number(step.position_x ?? 80) + 310),
  );
  const height = Math.max(
    620,
    ...steps.map((step) => Number(step.position_y ?? 80) + 210),
  );
  const byId = new Map(steps.map((step) => [step.id, step]));

  return (
    <div className="chat-scroll overflow-auto">
      <div
        className="relative bg-[radial-gradient(circle,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:26px_26px]"
        style={{ width, height }}
      >
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <marker id="arrow-cyan" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#00D1FF" />
            </marker>
            <marker id="arrow-violet" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#7B61FF" />
            </marker>
          </defs>
          {steps.flatMap((step) => {
            const links = [
              { id: step.next_step_id, color: "#00D1FF", marker: "url(#arrow-cyan)" },
              { id: step.secondary_step_id, color: "#7B61FF", marker: "url(#arrow-violet)" },
            ];
            return links
              .filter((link) => link.id && byId.has(link.id))
              .map((link) => {
                const target = byId.get(link.id!)!;
                const x1 = Number(step.position_x ?? 80) + 286;
                const y1 = Number(step.position_y ?? 80) + 78;
                const x2 = Number(target.position_x ?? 80);
                const y2 = Number(target.position_y ?? 80) + 78;
                const mid = x1 + Math.max(90, (x2 - x1) / 2);
                return (
                  <path
                    key={`${step.id}-${link.id}-${link.color}`}
                    d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    markerEnd={link.marker}
                    stroke={link.color}
                    strokeOpacity="0.78"
                    strokeWidth="2.5"
                  />
                );
              });
          })}
        </svg>
        {steps.map((step) => {
          const selected = step.id === selectedStepId;
          return (
            <button
              key={step.id}
              type="button"
              className={`absolute w-[286px] rounded-3xl border p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5 ${
                selected
                  ? "border-cyan-300/70 bg-[#132335]"
                  : "border-white/12 bg-[#101720]/96 hover:border-cyan-300/35"
              }`}
              style={{
                left: Number(step.position_x ?? 80),
                top: Number(step.position_y ?? 80),
              }}
              onClick={() => onSelect(step.id)}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">
                  <GitBranch size={13} />
                  No {step.step_order}
                </span>
                <span className="text-xs text-[#A9B4C3]">{step.is_active ? "ativo" : "off"}</span>
              </div>
              <p className="line-clamp-3 min-h-[62px] text-sm font-semibold leading-5 text-white">
                {step.message_text || (step.media_type !== "none" ? "No somente com midia" : "No sem texto")}
              </p>
              <div className="mt-3 grid gap-2 text-xs text-[#A9B4C3]">
                <NodeAction icon={MousePointerClick} color="text-cyan-100" label={step.primary_button_text || "sem botao principal"} />
                <NodeAction icon={ArrowRight} color="text-violet-100" label={step.secondary_button_text || "sem botao secundario"} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NodeAction({
  icon: Icon,
  color,
  label,
}: {
  icon: typeof MousePointerClick;
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Icon size={13} className={color} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function NodeEditor({
  step,
  steps,
  productName,
  onPatch,
}: {
  step: ChatStep | null;
  steps: ChatStep[];
  productName: string;
  onPatch: (id: string, patch: Partial<ChatStep>) => void;
}) {
  if (!step) {
    return (
      <Panel title="Editor do no" icon={Bot}>
        <p className="text-sm text-[#A9B4C3]">Crie ou selecione um no para editar.</p>
      </Panel>
    );
  }

  return (
    <Panel title={`No ${step.step_order}`} icon={MessageSquareText} subtitle={productName}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Ordem" value={String(step.step_order)} onChange={(value) => onPatch(step.id, { step_order: Number(value) })} />
        <Input label="Posicao X" value={String(step.position_x ?? 80)} onChange={(value) => onPatch(step.id, { position_x: Number(value) })} />
        <Input label="Posicao Y" value={String(step.position_y ?? 80)} onChange={(value) => onPatch(step.id, { position_y: Number(value) })} />
      </div>
      <Textarea
        label="Mensagem do bot"
        value={step.message_text}
        placeholder="Escreva o texto da bolha. Pode deixar vazio se for somente midia."
        rows={6}
        onChange={(value) => onPatch(step.id, { message_text: value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <MediaSelect value={step.media_type ?? "none"} onChange={(value) => onPatch(step.id, { media_type: value })} />
        <Input
          label="URL da imagem/video"
          value={step.media_url ?? ""}
          placeholder="https://..."
          onChange={(value) =>
            onPatch(step.id, {
              media_url: value || null,
              media_type: value ? step.media_type || "image" : "none",
            })
          }
        />
      </div>
      <Input
        label="Descricao da midia"
        value={step.media_alt ?? ""}
        onChange={(value) => onPatch(step.id, { media_alt: value || null })}
      />

      <ButtonLogic
        title="Botao principal"
        text={step.primary_button_text ?? ""}
        action={step.primary_button_action}
        linkedStepId={step.next_step_id ?? ""}
        steps={steps}
        currentId={step.id}
        onText={(value) => onPatch(step.id, { primary_button_text: value })}
        onAction={(value) => onPatch(step.id, { primary_button_action: value })}
        onLinkedStep={(value) => onPatch(step.id, { next_step_id: value || null })}
      />
      <ButtonLogic
        title="Botao secundario"
        text={step.secondary_button_text ?? ""}
        action={step.secondary_button_action ?? "next_step"}
        linkedStepId={step.secondary_step_id ?? ""}
        steps={steps}
        currentId={step.id}
        optional
        onText={(value) => onPatch(step.id, { secondary_button_text: value || null })}
        onAction={(value) => onPatch(step.id, { secondary_button_action: value })}
        onLinkedStep={(value) => onPatch(step.id, { secondary_step_id: value || null })}
      />

      <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-[#A9B4C3]">
        No ativo no funil
        <input
          type="checkbox"
          checked={step.is_active}
          onChange={(event) => onPatch(step.id, { is_active: event.target.checked })}
        />
      </label>
    </Panel>
  );
}

function ButtonLogic({
  title,
  text,
  action,
  linkedStepId,
  steps,
  currentId,
  optional,
  onText,
  onAction,
  onLinkedStep,
}: {
  title: string;
  text: string;
  action: ChatButtonAction;
  linkedStepId: string;
  steps: ChatStep[];
  currentId: string;
  optional?: boolean;
  onText: (value: string) => void;
  onAction: (value: ChatButtonAction) => void;
  onLinkedStep: (value: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D141C] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bold text-white">{title}</p>
        {optional ? <span className="text-xs text-[#718094]">opcional</span> : null}
      </div>
      <Input label="Texto do botao" value={text} placeholder="Ex: Comprar agora" onChange={onText} />
      <ActionSelect value={action} onChange={onAction} />
      <StepSelect
        value={linkedStepId}
        steps={steps}
        currentId={currentId}
        disabled={action !== "next_step"}
        onChange={onLinkedStep}
      />
    </div>
  );
}

function FaqEditor({
  faqs,
  onPatch,
  onAdd,
}: {
  faqs: Faq[];
  onPatch: (id: string, patch: Partial<Faq>) => void;
  onAdd: () => void;
}) {
  return (
    <Panel title="FAQ do chat" icon={Check} subtitle="Perguntas abertas pelo botao de duvidas">
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-2xl border border-white/10 bg-[#0D141C] p-3">
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <Input label="Ordem" value={String(faq.order)} onChange={(value) => onPatch(faq.id, { order: Number(value) })} />
              <Input label="Pergunta" value={faq.question} onChange={(value) => onPatch(faq.id, { question: value })} />
            </div>
            <Textarea label="Resposta" value={faq.answer} rows={3} onChange={(value) => onPatch(faq.id, { answer: value })} />
            <label className="mt-3 flex items-center justify-between text-sm text-[#A9B4C3]">
              Ativo
              <input
                type="checkbox"
                checked={faq.is_active}
                onChange={(event) => onPatch(faq.id, { is_active: event.target.checked })}
              />
            </label>
          </div>
        ))}
      </div>
      <NeonButton type="button" variant="secondary" className="mt-3 w-full" onClick={onAdd}>
        <BadgePlus size={17} />
        Adicionar FAQ
      </NeonButton>
    </Panel>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Bot;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,.22)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-black text-white">{title}</h3>
          {subtitle ? <p className="text-sm text-[#A9B4C3]">{subtitle}</p> : null}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <input
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none transition placeholder:text-[#566273] focus:border-cyan-300/45"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  placeholder,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <textarea
        className="rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-white outline-none transition placeholder:text-[#566273] focus:border-cyan-300/45"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ActionSelect({
  value,
  onChange,
}: {
  value: ChatButtonAction;
  onChange: (value: ChatButtonAction) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      Acao do botao
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value as ChatButtonAction)}
      >
        {actions.map((action) => (
          <option key={action.value} value={action.value}>
            {action.label} - {action.helper}
          </option>
        ))}
      </select>
    </label>
  );
}

function MediaSelect({
  value,
  onChange,
}: {
  value: ChatMediaType;
  onChange: (value: ChatMediaType) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      Tipo de midia
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value as ChatMediaType)}
      >
        {mediaTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StepSelect({
  value,
  steps,
  currentId,
  disabled,
  onChange,
}: {
  value: string;
  steps: ChatStep[];
  currentId: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      Destino conectado
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none disabled:opacity-45"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Proximo pela ordem</option>
        {steps
          .filter((step) => step.id !== currentId)
          .map((step) => (
            <option key={step.id} value={step.id}>
              No {step.step_order} - {(step.message_text || "sem texto").slice(0, 48)}
            </option>
          ))}
      </select>
    </label>
  );
}
