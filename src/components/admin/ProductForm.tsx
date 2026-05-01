"use client";

import { useMemo, useState } from "react";
import { Check, ImageIcon, Package, Save, Sparkles } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatCurrency } from "@/lib/env";
import type { Product, ProductDeliveryType } from "@/lib/types";

const deliveryOptions: Array<{
  value: ProductDeliveryType;
  label: string;
  helper: string;
}> = [
  {
    value: "digital_credential",
    label: "Credencial digital",
    helper: "E-mail, senha, URL e instrucoes",
  },
  { value: "file", label: "Arquivo", helper: "Entrega de arquivo digital" },
  { value: "link", label: "Link", helper: "URL unica ou instrucoes" },
  { value: "custom_text", label: "Texto", helper: "Entrega personalizada" },
];

export function ProductForm({ product }: { product?: Product | null }) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: String(product?.price ?? "27.90"),
    is_active: product?.is_active ?? true,
    delivery_type: product?.delivery_type ?? "digital_credential",
    image_url: product?.image_url ?? "",
    support_text: product?.support_text ?? "",
    default_instructions: product?.default_instructions ?? "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const pricePreview = useMemo(() => {
    const price = Number(String(form.price).replace(",", "."));
    return Number.isFinite(price) ? formatCurrency(price) : "R$ 0,00";
  }, [form.price]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(
      product ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(String(form.price).replace(",", ".")),
        }),
      },
    );
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Produto salvo com sucesso." : payload.error ?? "Erro ao salvar produto.");
  }

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={submit}>
      <div className="space-y-5">
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <SectionTitle
            icon={Package}
            title="Oferta"
            description="Nome, URL publica, preco e posicionamento do produto."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Nome do produto"
              value={form.name}
              placeholder="CapCut Pro - Acesso Digital"
              onChange={(value) => update("name", value)}
            />
            <Input
              label="Slug da pagina"
              value={form.slug}
              placeholder="capcut-pro"
              onChange={(value) => update("slug", value)}
            />
            <Input
              label="Preco"
              value={form.price}
              placeholder="27.90"
              onChange={(value) => update("price", value)}
            />
            <Input
              label="Imagem do produto"
              value={form.image_url}
              placeholder="https://..."
              onChange={(value) => update("image_url", value)}
            />
          </div>
          <Textarea
            label="Descricao curta"
            value={form.description}
            placeholder="Explique o que o cliente compra em uma frase clara."
            onChange={(value) => update("description", value)}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <SectionTitle
            icon={Sparkles}
            title="Entrega"
            description="Defina como o sistema deve liberar o produto apos o pagamento."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {deliveryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-2xl border p-4 text-left transition ${
                  form.delivery_type === option.value
                    ? "border-cyan-300/55 bg-cyan-300/10"
                    : "border-white/10 bg-[#0D141C] hover:border-white/18"
                }`}
                onClick={() => update("delivery_type", option.value)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{option.label}</span>
                  {form.delivery_type === option.value ? (
                    <Check size={17} className="text-cyan-100" />
                  ) : null}
                </span>
                <span className="mt-1 block text-sm text-[#A9B4C3]">{option.helper}</span>
              </button>
            ))}
          </div>
          <Textarea
            label="Instrucoes padrao da entrega"
            value={form.default_instructions}
            placeholder="1. Abra o app...\n2. Faca login...\n3. Nao altere dados de seguranca..."
            rows={7}
            onChange={(value) => update("default_instructions", value)}
          />
          <Input
            label="Garantia e suporte"
            value={form.support_text}
            placeholder="Suporte em caso de dificuldade de acesso."
            onChange={(value) => update("support_text", value)}
          />
        </section>
      </div>

      <aside className="space-y-4">
        <div className="sticky top-6 rounded-3xl border border-white/10 bg-[#0D141C] p-5 shadow-[0_22px_60px_rgba(0,0,0,.28)]">
          <p className="text-sm font-bold text-white">Preview da oferta</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
            {form.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center text-[#718094]">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
          <h3 className="mt-4 text-xl font-black text-white">
            {form.name || "Novo produto digital"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#A9B4C3]">
            {form.description || "Descricao objetiva da oferta para aparecer no funil."}
          </p>
          <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs text-cyan-100">Valor de venda</p>
            <p className="text-3xl font-black text-white">{pricePreview}</p>
          </div>
          <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-[#A9B4C3]">
            Produto ativo
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => update("is_active", event.target.checked)}
            />
          </label>
          {message ? (
            <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
              {message}
            </p>
          ) : null}
          <NeonButton className="mt-4 w-full" disabled={saving}>
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar produto"}
          </NeonButton>
        </div>
      </aside>
    </form>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Package;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        <p className="text-sm leading-6 text-[#A9B4C3]">{description}</p>
      </div>
    </div>
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
        className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none transition placeholder:text-[#566273] focus:border-cyan-300/45"
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
    <label className="mt-4 grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
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
