"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, KeyRound, PlugZap, QrCode, Save } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import type { PaymentGatewaySettings, PaymentProviderKey } from "@/lib/types";

const providers: Array<{
  key: PaymentProviderKey;
  title: string;
  tag: string;
  description: string;
  fields: string[];
}> = [
  {
    key: "mock",
    title: "Mock Pix",
    tag: "teste",
    description: "Gera Pix fake e permite aprovar pagamento pelo painel.",
    fields: ["Nenhuma credencial real necessaria."],
  },
  {
    key: "pushinpay",
    title: "PushinPay",
    tag: "producao",
    description: "Usa POST /pix/cashIn, consulta /transactions/{id} e webhook de status.",
    fields: ["Authorization: Bearer TOKEN", "Valor enviado em centavos", "Webhook URL"],
  },
  {
    key: "amplopay",
    title: "AmploPay",
    tag: "producao",
    description: "Usa POST /gateway/pix/receive com public key, secret key e callbackUrl.",
    fields: ["x-public-key", "x-secret-key", "Callback URL"],
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
    webhookUrl: "https://chat-sales.vercel.app/api/payments/webhook",
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
  const [saving, setSaving] = useState(false);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.key === settings.activeProvider) ?? providers[0],
    [settings.activeProvider],
  );

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
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Gateway salvo. O Pix usara o provedor selecionado." : payload.error ?? "Erro ao salvar gateway.");
    if (response.ok) setSettings(payload.settings);
  }

  function setProvider(activeProvider: PaymentProviderKey) {
    setSettings((current) => ({ ...current, activeProvider }));
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_430px]" onSubmit={save}>
      <GlassCard className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black">Gateway Pix ativo</h2>
            <p className="text-sm text-[#A9B4C3]">
              Escolha o gateway, preencha somente as credenciais dele e salve.
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {providers.map((provider) => {
            const selected = settings.activeProvider === provider.key;
            return (
              <button
                key={provider.key}
                type="button"
                className={`rounded-3xl border p-4 text-left transition ${
                  selected
                    ? "border-cyan-300/65 bg-cyan-300/10 shadow-[0_18px_50px_rgba(0,209,255,.08)]"
                    : "border-white/10 bg-[#0D141C] hover:border-white/20"
                }`}
                onClick={() => setProvider(provider.key)}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-black text-white">{provider.title}</span>
                    <span className="mt-1 inline-flex rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-bold text-[#A9B4C3]">
                      {provider.tag}
                    </span>
                  </span>
                  {selected ? <CheckCircle2 size={18} className="text-cyan-100" /> : null}
                </span>
                <span className="mt-3 block text-sm leading-5 text-[#A9B4C3]">
                  {provider.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-[#0D141C] p-4">
          <div className="flex items-center gap-3">
            <PlugZap size={18} className="text-cyan-100" />
            <div>
              <p className="font-bold text-white">Configuracao do {activeProvider.title}</p>
              <p className="text-sm text-[#A9B4C3]">
                Estes campos ficam salvos no painel e definem quem gera o Pix.
              </p>
            </div>
          </div>

          <label className="grid gap-1 text-sm font-medium text-[#A9B4C3]">
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
              <option value="production">Producao</option>
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
            label="API externa para imagem do QR Code"
            value={settings.qrImageApiUrl}
            onChange={(qrImageApiUrl) =>
              setSettings((current) => ({ ...current, qrImageApiUrl }))
            }
          />

          {settings.activeProvider === "pushinpay" ? (
            <Input
              label="PushinPay API Key / Bearer token"
              type="password"
              value={settings.pushinpayApiKey ?? ""}
              onChange={(pushinpayApiKey) =>
                setSettings((current) => ({ ...current, pushinpayApiKey }))
              }
            />
          ) : null}

          {settings.activeProvider === "amplopay" ? (
            <div className="grid gap-3 md:grid-cols-2">
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
          ) : null}
        </div>

        {message ? (
          <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
            {message}
          </p>
        ) : null}
        <NeonButton className="w-full sm:w-fit" disabled={saving}>
          <Save size={17} />
          {saving ? "Salvando..." : `Salvar e usar ${activeProvider.title}`}
        </NeonButton>
      </GlassCard>

      <GlassCard className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-300/10 text-violet-100">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black">O que este gateway pede</h2>
            <p className="text-sm text-[#A9B4C3]">
              Checklist dinamico para preencher sem confusao.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {activeProvider.fields.map((field) => (
            <div
              key={field}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white"
            >
              <CheckCircle2 size={16} className="text-cyan-100" />
              {field}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <QrCode size={16} />
            QR Code por imagem externa
          </div>
          <p className="text-sm leading-6 text-[#A9B4C3]">
            Mesmo que o gateway falhe ao mandar base64, a tela gera uma imagem do
            QR Code a partir do Pix copia e cola.
          </p>
        </div>

        <div className="space-y-2">
          <EnvRow label="PushinPay token salvo" ok={Boolean(settings.pushinpayApiKey) || env.pushinpayApiKey} />
          <EnvRow label="AmploPay public key salva" ok={Boolean(settings.amplopayPublicKey) || env.amplopayPublicKey} />
          <EnvRow label="AmploPay secret key salva" ok={Boolean(settings.amplopaySecretKey) || env.amplopaySecretKey} />
          <EnvRow label="Webhook configurado" ok={Boolean(settings.webhookUrl)} />
        </div>
      </GlassCard>
    </form>
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
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <input
        className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none transition focus:border-cyan-300/45"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EnvRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <span className="text-sm text-white">{label}</span>
      <span className={ok ? "text-xs font-bold text-cyan-100" : "text-xs font-bold text-amber-200"}>
        {ok ? "ok" : "pendente"}
      </span>
    </div>
  );
}
