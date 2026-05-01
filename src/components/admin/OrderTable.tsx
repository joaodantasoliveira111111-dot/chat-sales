"use client";

import Link from "next/link";
import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatCurrency } from "@/lib/env";
import type { Order } from "@/lib/types";

export function OrderTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");

  async function refresh() {
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setOrders(payload.orders);
  }

  async function simulate(orderId: string) {
    const response = await fetch(`/api/admin/orders/${orderId}/simulate-payment`, {
      method: "POST",
    });
    const payload = await response.json();
    setMessage(response.ok ? "Pagamento simulado e entrega processada." : payload.error);
    await refresh();
  }

  return (
    <div className="space-y-4">
      {message ? <p className="rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{message}</p> : null}
      <div className="overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-white/[0.05] text-[#A9B4C3]">
            <tr>
              <th className="p-3">Pedido</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pagamento</th>
              <th className="p-3">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="p-3 font-mono text-xs">{order.id}</td>
                <td className="p-3">
                  <p>{order.customer_name}</p>
                  <p className="text-xs text-[#A9B4C3]">{order.customer_email}</p>
                </td>
                <td className="p-3">{order.products?.name ?? order.product_id}</td>
                <td className="p-3">{formatCurrency(order.amount)}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3 font-mono text-xs">{order.gateway_payment_id ?? "-"}</td>
                <td className="flex gap-2 p-3">
                  <Link href={`/admin/orders/${order.id}`}>
                    <NeonButton type="button" variant="secondary">
                      Ver
                    </NeonButton>
                  </Link>
                  {order.status === "pending" ? (
                    <NeonButton type="button" onClick={() => simulate(order.id)}>
                      Simular aprovado
                    </NeonButton>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
