"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatCurrency } from "@/lib/env";
import type { Product } from "@/lib/types";

type CheckoutCardProps = {
  product: Product;
  sessionId: string;
  onCreated: (payment: {
    orderId: string;
    pixCode: string;
    qrCodeUrl: string;
    amount: number;
    status: string;
  }) => void;
};

export function CheckoutCard({ product, sessionId, onCreated }: CheckoutCardProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productSlug: product.slug,
        sessionId,
        customerName,
        customerEmail,
        customerWhatsapp,
      }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Nao foi possivel gerar o Pix.");
      return;
    }

    onCreated(payload);
  }

  return (
    <GlassCard className="space-y-5 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
          <LockKeyhole size={19} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Resumo da compra</h2>
          <p className="text-sm text-[#A9B4C3]">
            Seus dados de acesso serao liberados aqui mesmo na tela.
          </p>
        </div>
      </div>

      <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
        <Info label="Produto" value={product.name} />
        <Info label="Valor" value={formatCurrency(product.price)} />
        <Info label="Entrega" value="Dentro desta conversa após confirmação" />
        <Info label="Indicado para" value="Uso pessoal" />
      </div>

      <form className="space-y-3" onSubmit={submit}>
        <Input label="Nome" value={customerName} onChange={setCustomerName} required />
        <Input
          label="E-mail"
          type="email"
          value={customerEmail}
          onChange={setCustomerEmail}
          required
        />
        <Input
          label="WhatsApp opcional"
          value={customerWhatsapp}
          onChange={setCustomerWhatsapp}
        />
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        <NeonButton className="w-full" disabled={loading}>
          {loading ? "Gerando Pix..." : "Gerar Pix"}
        </NeonButton>
      </form>
    </GlassCard>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[#A9B4C3]">{label}</span>
      <span className="max-w-[58%] text-right font-medium text-white">{value}</span>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm text-[#A9B4C3]">
      <span>{label}</span>
      <input
        className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
