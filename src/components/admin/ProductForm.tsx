"use client";

import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { Product } from "@/lib/types";

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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(
      product ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      },
    );
    setMessage(response.ok ? "Produto salvo." : "Erro ao salvar produto.");
  }

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <Input label="Nome" value={form.name} onChange={(value) => update("name", value)} />
      <Input label="Slug" value={form.slug} onChange={(value) => update("slug", value)} />
      <Input label="Preco" value={form.price} onChange={(value) => update("price", value)} />
      <label className="grid gap-1 text-sm text-[#A9B4C3]">
        Descricao
        <textarea
          className="min-h-24 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </label>
      <label className="grid gap-1 text-sm text-[#A9B4C3]">
        Tipo de entrega
        <select
          className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
          value={form.delivery_type}
          onChange={(event) => update("delivery_type", event.target.value)}
        >
          <option value="digital_credential">digital_credential</option>
          <option value="file">file</option>
          <option value="link">link</option>
          <option value="custom_text">custom_text</option>
        </select>
      </label>
      <Input
        label="Imagem opcional"
        value={form.image_url}
        onChange={(value) => update("image_url", value)}
      />
      <Input
        label="Garantia/suporte"
        value={form.support_text}
        onChange={(value) => update("support_text", value)}
      />
      <label className="grid gap-1 text-sm text-[#A9B4C3]">
        Instrucoes padrao
        <textarea
          className="min-h-32 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none"
          value={form.default_instructions}
          onChange={(event) => update("default_instructions", event.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-[#A9B4C3]">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => update("is_active", event.target.checked)}
        />
        Produto ativo
      </label>
      {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
      <NeonButton className="w-fit">Salvar produto</NeonButton>
    </form>
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
        className="min-h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
