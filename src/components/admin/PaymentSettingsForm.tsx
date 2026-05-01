"use client";

import { useEffect, useState } from "react";
import { CreditCard, KeyRound, QrCode } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import type { PaymentGatewaySettings, PaymentProviderKey } from "@/lib/types";

const providers: Array<{
  key: PaymentProviderKey;
  title: string;
  description: string;
}> = [
  {
    key: "mock",
    title: "Mock Pix",
    description: "Ambiente de teste com simulação pelo painel.",
  },
  {
    key: "pushinpay",
    title: "PushinPay",
    description: "POST /pix/cashIn, GET /transactions/{id} e webhook por status.",
  },
  {
    key: "amplopay",
    title: "AmploPay",
    description: "POST /gateway/pix/receive e webhooks TRANSACTION_*.",
  },
];

type EnvStatus = {
  pushinpayApiKey: boolean;
  amplopayPublicKey: boolean;
  amplopaySecretKey: boolean;
};

export function PaymentSettingsForm() {
  const [settings, setSettings] = useState<PaymentGatewaySettings>({
    activeProvider: "mock",
    mode: "production",
    webhookUrl: "http://localhost:3000/api/payments/webhook",
    qrImageApiUrl: "https://api.qrserver.com/v1/create-qr-code/",
    pushinpayApiKey: "",
    amplopayPublicKey: "",
    amplopaySecretKey: "",
  });
  const [env, setEnv] = useState<EnvStatus>({
    pushinpayApiKey: false,
    amplopayPublicKey: false,
    amplopaySecretKey: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/settings/payments", {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setSettings(payload.settings);
      setEnv(payload.env);
    }
    void load();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const payload = await response.json();
    setMessage(response.ok ? "Gateway atualizado." : payload.error);
    if (response.ok) setSettings(payload.settings);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <GlassCard className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Gateway Pix ativo</h2>
            <p className="text-sm text-[#A9B4C3]">
              Alterne entre Mock, PushinPay e AmploPay sem mexer no código.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-3 lg:grid-cols-3">
            {providers.map((provider) => (
              <button
                key={provider.key}
                type="button"
                className={`rounded-3xl border p-4 text-left transition ${
                  settings.activeProvider === provider.key
                    ? "border-cyan-300/60 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
                }`}
                onClick={() =>
                  setSettings((current) => ({
                    ...current,
                    activeProvider: provider.key,
                  }))
                }
              >
                <p className="font-semibold text-white">{provider.title}</p>
                <p className="mt-2 text-sm leading-5 text-[#A9B4C3]">
                  {provider.description}
                </p>
              </button>
            ))}
          </div>

          <label className="grid gap-1 text-sm text-[#A9B4C3]">
            Ambiente
            <select
              className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
              value={settings.mode}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  mode: event.target.value as PaymentGatewaySettings["mode"],
                }))
              }
            >
              <option value="production">Produção</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </label>

          <Input
            label="Webhook URL"
            value={settings.webhookUrl}
            onChange={(webhookUrl) =>
              setSettings((current) => ({ ...current, webhookUrl }))
            }
          />
          <Input
            label="API de imagem para QR Code"
            value={settings.qrImageApiUrl}
            onChange={(qrImageApiUrl) =>
              setSettings((current) => ({ ...current, qrImageApiUrl }))
            }
          />
          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">Chaves reais</p>
            <Input
              label="PushinPay API Key"
              type="password"
              value={settings.pushinpayApiKey ?? ""}
              onChange={(pushinpayApiKey) =>
                setSettings((current) => ({ ...current, pushinpayApiKey }))
              }
            />
            <Input
              label="AmploPay Public Key"
              type="password"
              value={settings.amplopayPublicKey ?? ""}
              onChange={(amplopayPublicKey) =>
                setSettings((current) => ({ ...current, amplopayPublicKey }))
              }
            />
            <Input
              label="AmploPay Secret Key"
              type="password"
              value={settings.amplopaySecretKey ?? ""}
              onChange={(amplopaySecretKey) =>
                setSettings((current) => ({ ...current, amplopaySecretKey }))
              }
            />
          </div>

          {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
          <NeonButton>Salvar gateway ativo</NeonButton>
        </form>
      </GlassCard>

      <GlassCard className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Credenciais esperadas</h2>
            <p className="text-sm text-[#A9B4C3]">
              Salve as chaves reais aqui no painel admin.
            </p>
          </div>
        </div>
        <EnvRow label="PUSHINPAY_API_KEY" ok={env.pushinpayApiKey} />
        <EnvRow label="AMPLOPAY_PUBLIC_KEY" ok={env.amplopayPublicKey} />
        <EnvRow label="AMPLOPAY_SECRET_KEY" ok={env.amplopaySecretKey} />
        <EnvRow label="PAYMENT_WEBHOOK_URL" ok={Boolean(settings.webhookUrl)} />
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <QrCode size={16} />
            QR Code
          </div>
          <p className="text-sm leading-6 text-[#A9B4C3]">
            A imagem do QR é gerada por API externa a partir do Pix copia e cola,
            evitando depender do base64 retornado pelo gateway.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#A9B4C3]">
      {label}
      <input
        className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EnvRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <code className="text-sm text-white">{label}</code>
      <span className={ok ? "text-xs text-cyan-100" : "text-xs text-amber-200"}>
        {ok ? "configurado" : "pendente"}
      </span>
    </div>
  );
}
