"use client";

import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { InventoryItem, Product } from "@/lib/types";

export function InventoryTable({
  products,
  initialItems,
}: {
  products: Product[];
  initialItems: InventoryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    product_id: products[0]?.id ?? "",
    title: "",
    access_email: "",
    access_password: "",
    access_url: "",
    extra_instructions: "",
  });

  async function refresh() {
    const response = await fetch("/api/admin/inventory", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setItems(payload.inventory);
  }

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "available" }),
    });
    setMessage(response.ok ? "Entregavel cadastrado." : "Erro ao cadastrar.");
    await refresh();
  }

  async function importCsv() {
    const response = await fetch("/api/admin/inventory/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const payload = await response.json();
    setMessage(response.ok ? `${payload.imported} itens importados.` : payload.error);
    await refresh();
  }

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{message}</p> : null}
      <form className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2" onSubmit={addItem}>
        <label className="grid gap-1 text-sm text-[#A9B4C3]">
          Produto
          <select
            className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
            value={form.product_id}
            onChange={(event) => setForm({ ...form, product_id: event.target.value })}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <Input label="Titulo" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <Input label="E-mail de acesso" value={form.access_email} onChange={(value) => setForm({ ...form, access_email: value })} />
        <Input label="Senha" value={form.access_password} onChange={(value) => setForm({ ...form, access_password: value })} />
        <Input label="URL opcional" value={form.access_url} onChange={(value) => setForm({ ...form, access_url: value })} />
        <Input label="Instrucoes extras" value={form.extra_instructions} onChange={(value) => setForm({ ...form, extra_instructions: value })} />
        <NeonButton className="md:col-span-2">Adicionar entregavel</NeonButton>
      </form>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-2 font-semibold">Importar CSV</p>
        <p className="mb-3 text-sm text-[#A9B4C3]">
          Colunas: product_slug,email,password,access_url,extra_instructions
        </p>
        <textarea
          className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-sm text-white outline-none"
          value={csv}
          onChange={(event) => setCsv(event.target.value)}
          placeholder="product_slug,email,password,access_url,extra_instructions"
        />
        <NeonButton type="button" variant="secondary" className="mt-3" onClick={importCsv}>
          Importar CSV
        </NeonButton>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.05] text-[#A9B4C3]">
            <tr>
              <th className="p-3">Titulo</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pedido</th>
              <th className="p-3">Entregue em</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="p-3">{item.title}</td>
                <td className="p-3 font-mono text-xs">{item.access_email}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3 font-mono text-xs">{item.assigned_order_id ?? "-"}</td>
                <td className="p-3">{item.delivered_at ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
