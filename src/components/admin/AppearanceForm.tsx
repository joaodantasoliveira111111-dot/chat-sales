"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Monitor, Palette, Save, Smartphone } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { PageAppearanceSettings, Product, VisualTemplateKey } from "@/lib/types";

const templates: Array<{ key: VisualTemplateKey; name: string; helper: string }> = [
  { key: "dark_premium", name: "Dark Premium", helper: "Tecnologico, glass e gradiente ciano/roxo." },
  { key: "whatsapp_inspired", name: "WhatsApp Inspired", helper: "Claro, familiar e atendimento humano." },
  { key: "instagram_dm", name: "Instagram DM Inspired", helper: "Mobile first, visual de direct moderno." },
  { key: "minimal_chat", name: "Minimal Chat", helper: "Limpo, direto e focado em conversao." },
];

export function AppearanceForm({
  products,
  initialProductId,
  initialSettings,
}: {
  products: Product[];
  initialProductId: string;
  initialSettings: PageAppearanceSettings;
}) {
  const [productId, setProductId] = useState(initialProductId);
  const [settings, setSettings] = useState(initialSettings);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? products[0],
    [productId, products],
  );

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/admin/appearance?product_id=${productId}`, {
        cache: "no-store",
      });
      if (!response.ok) return;
      const payload = await response.json();
      setSettings(payload.settings);
    }
    void load();
  }, [productId]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/appearance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, settings }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Aparencia salva." : payload.error ?? "Erro ao salvar.");
    if (response.ok) setSettings(payload.settings);
  }

  function patch(patch: Partial<PageAppearanceSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
  }

  return (
    <form className="grid gap-5 xl:grid-cols-[1fr_440px]" onSubmit={save}>
      <section className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Aparencia da pagina</h2>
            <p className="text-sm text-[#A9B4C3]">
              Configure a pagina publica como oferta do produto, sem cara de plataforma generica.
            </p>
          </div>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
          Produto
          <select
            className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              className={`rounded-3xl border p-4 text-left transition ${
                settings.template === template.key
                  ? "border-cyan-300/60 bg-cyan-300/10"
                  : "border-white/10 bg-[#0D141C] hover:border-white/20"
              }`}
              onClick={() => patch({ template: template.key })}
            >
              <p className="font-black text-white">{template.name}</p>
              <p className="mt-1 text-sm leading-5 text-[#A9B4C3]">{template.helper}</p>
            </button>
          ))}
        </div>

        <Input label="Nome publico da oferta" value={settings.publicOfferName} onChange={(publicOfferName) => patch({ publicOfferName })} />
        <Textarea label="Subtitulo publico" value={settings.publicSubtitle} rows={3} onChange={(publicSubtitle) => patch({ publicSubtitle })} />
        <Input label="Avatar da conversa" value={settings.avatarUrl ?? ""} onChange={(avatarUrl) => patch({ avatarUrl: avatarUrl || null })} />
        <Input label="Microcredibilidade" value={settings.microCredibilityText} onChange={(microCredibilityText) => patch({ microCredibilityText })} />

        <div className="grid gap-3 md:grid-cols-3">
          <Input label="Cor principal" value={settings.primaryColor} onChange={(primaryColor) => patch({ primaryColor })} />
          <Input label="Cor secundaria" value={settings.secondaryColor} onChange={(secondaryColor) => patch({ secondaryColor })} />
          <Input label="Background" value={settings.background} onChange={(background) => patch({ background })} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Select label="Bolhas" value={settings.bubbleStyle} options={["rounded", "compact", "soft"]} onChange={(value) => patch({ bubbleStyle: value as PageAppearanceSettings["bubbleStyle"] })} />
          <Select label="Botoes" value={settings.buttonStyle} options={["gradient", "solid", "outline"]} onChange={(value) => patch({ buttonStyle: value as PageAppearanceSettings["buttonStyle"] })} />
          <Select label="Fonte" value={settings.font} options={["geist", "inter", "system"]} onChange={(value) => patch({ font: value as PageAppearanceSettings["font"] })} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Toggle label="Mostrar cabecalho" checked={settings.showHeader} onChange={(showHeader) => patch({ showHeader })} />
          <Toggle label="Suporte no topo" checked={settings.showTopSupport} onChange={(showTopSupport) => patch({ showTopSupport })} />
          <Toggle label="Microcredibilidade" checked={settings.showMicroCredibility} onChange={(showMicroCredibility) => patch({ showMicroCredibility })} />
        </div>

        {message ? (
          <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
            {message}
          </p>
        ) : null}
        <NeonButton className="w-full sm:w-fit" disabled={saving}>
          <Save size={16} />
          {saving ? "Salvando..." : "Salvar aparencia"}
        </NeonButton>
      </section>

      <aside className="space-y-4">
        <div className="flex gap-2">
          <NeonButton
            type="button"
            variant={previewMode === "mobile" ? "primary" : "secondary"}
            onClick={() => setPreviewMode("mobile")}
          >
            <Smartphone size={16} />
            Mobile
          </NeonButton>
          <NeonButton
            type="button"
            variant={previewMode === "desktop" ? "primary" : "secondary"}
            onClick={() => setPreviewMode("desktop")}
          >
            <Monitor size={16} />
            Desktop
          </NeonButton>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <Eye size={16} />
            Preview
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-[32px] border border-white/10 p-4 shadow-[0_20px_70px_rgba(0,0,0,.32)] ${
              previewMode === "mobile" ? "max-w-[320px]" : "max-w-full"
            }`}
            style={{ background: settings.background }}
          >
            <p className="text-2xl font-black text-white">{settings.publicOfferName}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{settings.publicSubtitle}</p>
            {settings.showMicroCredibility ? (
              <p className="mt-3 rounded-full bg-white/10 px-3 py-2 text-xs text-white/80">
                {settings.microCredibilityText}
              </p>
            ) : null}
            <div className="mt-5 rounded-3xl bg-white/10 p-4">
              <div className="mr-auto max-w-[86%] rounded-3xl bg-white/12 p-3 text-sm text-white">
                Você usa CapCut e quer liberar mais recursos?
              </div>
              <div
                className="ml-auto mt-3 max-w-[78%] rounded-3xl p-3 text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                }}
              >
                Sim, quero
              </div>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Produto: {selectedProduct?.name}
            </p>
          </div>
        </div>
      </aside>
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
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <input
        className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none focus:border-cyan-300/45"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  rows = 4,
  onChange,
}: {
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <textarea
        className="rounded-2xl border border-white/10 bg-[#111820] px-4 py-3 text-white outline-none focus:border-cyan-300/45"
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <select
        className="min-h-12 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#111820] px-4 text-sm font-medium text-[#A9B4C3]">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
