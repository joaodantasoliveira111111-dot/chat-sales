"use client";

import { useMemo, useState } from "react";
import {
  BadgePlus,
  Bot,
  Copy,
  GitBranch,
  MousePointerClick,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import type { Flow, FlowEdge, FlowNode, FlowNodeType, Product } from "@/lib/types";

const nodeTypes: Array<{ value: FlowNodeType; label: string }> = [
  { value: "start", label: "Start" },
  { value: "text_message", label: "Texto" },
  { value: "button_message", label: "Mensagem + botoes" },
  { value: "media_message", label: "Midia" },
  { value: "input", label: "Input" },
  { value: "condition", label: "Condicao" },
  { value: "faq", label: "FAQ" },
  { value: "checkout", label: "Checkout" },
  { value: "pix_payment", label: "Pix" },
  { value: "wait_payment", label: "Aguardar pagamento" },
  { value: "delivery", label: "Entrega" },
  { value: "support", label: "Suporte" },
  { value: "action", label: "Acao/Webhook" },
  { value: "redirect", label: "Redirect" },
  { value: "end", label: "Fim" },
];

const themes = ["dark_premium", "whatsapp_inspired", "instagram_dm", "minimal_chat"] as const;

type FlowBuilderProps = {
  products: Product[];
  initialFlow: Flow;
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
};

export function FlowBuilder({
  products,
  initialFlow,
  initialNodes,
  initialEdges,
}: FlowBuilderProps) {
  const [flow, setFlow] = useState(initialFlow);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedId, setSelectedId] = useState(
    initialFlow.start_node_id ?? initialNodes[0]?.id ?? "",
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? nodes[0] ?? null;
  const edgeMap = useMemo(
    () => new Map(edges.map((edge) => [`${edge.source_node_id}:${edge.source_handle}`, edge])),
    [edges],
  );

  function patchNode(id: string, patch: Partial<FlowNode>) {
    setNodes((current) =>
      current.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    );
  }

  function patchConfig(id: string, patch: Record<string, unknown>) {
    setNodes((current) =>
      current.map((node) =>
        node.id === id ? { ...node, config: { ...node.config, ...patch } } : node,
      ),
    );
  }

  function connect(sourceNodeId: string, sourceHandle: string, targetNodeId: string) {
    setEdges((current) => {
      const filtered = current.filter(
        (edge) =>
          !(edge.source_node_id === sourceNodeId && edge.source_handle === sourceHandle),
      );
      if (!targetNodeId) return filtered;
      return [
        ...filtered,
        {
          id: crypto.randomUUID(),
          flow_id: flow.id,
          source_node_id: sourceNodeId,
          source_handle: sourceHandle,
          target_node_id: targetNodeId,
          condition: null,
        },
      ];
    });
  }

  function addNode(type: FlowNodeType = "button_message") {
    const node: FlowNode = {
      id: crypto.randomUUID(),
      flow_id: flow.id,
      type,
      title: nodeTypes.find((item) => item.value === type)?.label ?? "Novo no",
      position_x: 120 + nodes.length * 42,
      position_y: 120 + nodes.length * 34,
      config: defaultConfig(type, products[0]?.id),
    };
    setNodes((current) => [...current, node]);
    setSelectedId(node.id);
  }

  function duplicateNode(node: FlowNode) {
    const copyNode = {
      ...node,
      id: crypto.randomUUID(),
      title: `${node.title} copia`,
      position_x: node.position_x + 40,
      position_y: node.position_y + 40,
    };
    setNodes((current) => [...current, copyNode]);
    setSelectedId(copyNode.id);
  }

  function deleteNode(id: string) {
    setNodes((current) => current.filter((node) => node.id !== id));
    setEdges((current) =>
      current.filter((edge) => edge.source_node_id !== id && edge.target_node_id !== id),
    );
    if (selectedId === id) setSelectedId(nodes.find((node) => node.id !== id)?.id ?? "");
  }

  function onDragStart(event: React.PointerEvent<HTMLButtonElement>, node: FlowNode) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = node.position_x;
    const originalY = node.position_y;
    const target = event.currentTarget;

    function move(moveEvent: PointerEvent) {
      patchNode(node.id, {
        position_x: Math.max(20, originalX + moveEvent.clientX - startX),
        position_y: Math.max(20, originalY + moveEvent.clientY - startY),
      });
    }

    function up(upEvent: PointerEvent) {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/flows/${flow.id}/graph`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow, nodes, edges }),
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "Fluxo salvo." : payload.error ?? "Erro ao salvar.");
  }

  return (
    <div className="grid gap-5 2xl:grid-cols-[1fr_430px]">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#070B10]">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.035] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid gap-2 md:grid-cols-4">
            <Input label="Nome" value={flow.name} onChange={(name) => setFlow({ ...flow, name })} />
            <Input label="Slug" value={flow.slug} onChange={(slug) => setFlow({ ...flow, slug })} />
            <label className="grid gap-1 text-xs font-bold text-[#A9B4C3]">
              Produto
              <select
                className="min-h-10 rounded-xl border border-white/10 bg-[#111820] px-3 text-sm text-white"
                value={flow.product_id}
                onChange={(event) => setFlow({ ...flow, product_id: event.target.value })}
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[#A9B4C3]">
              Template
              <select
                className="min-h-10 rounded-xl border border-white/10 bg-[#111820] px-3 text-sm text-white"
                value={flow.theme_id}
                onChange={(event) =>
                  setFlow({ ...flow, theme_id: event.target.value as Flow["theme_id"] })
                }
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <NeonButton type="button" variant="secondary" onClick={() => addNode()}>
              <BadgePlus size={16} />
              Adicionar no
            </NeonButton>
            <NeonButton
              type="button"
              variant="secondary"
              onClick={() =>
                setFlow({
                  ...flow,
                  status: flow.status === "published" ? "draft" : "published",
                  published_at:
                    flow.status === "published" ? flow.published_at : new Date().toISOString(),
                })
              }
            >
              <Play size={16} />
              {flow.status === "published" ? "Despublicar" : "Publicar"}
            </NeonButton>
            <NeonButton type="button" onClick={save} disabled={saving}>
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar"}
            </NeonButton>
          </div>
        </div>

        {message ? (
          <p className="m-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
            {message}
          </p>
        ) : null}
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          selectedId={selectedNode?.id}
          onSelect={setSelectedId}
          onDragStart={onDragStart}
        />
      </section>

      <aside className="space-y-4">
        <NodePanel
          node={selectedNode}
          nodes={nodes}
          edgeMap={edgeMap}
          flow={flow}
          products={products}
          onPatch={patchNode}
          onConfig={patchConfig}
          onConnect={connect}
          onDuplicate={duplicateNode}
          onDelete={deleteNode}
          onStart={(id) => setFlow({ ...flow, start_node_id: id })}
        />
        <PreviewPanel nodes={nodes} flow={flow} />
      </aside>
    </div>
  );
}

function FlowCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  onDragStart,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDragStart: (event: React.PointerEvent<HTMLButtonElement>, node: FlowNode) => void;
}) {
  const width = Math.max(1200, ...nodes.map((node) => node.position_x + 320));
  const height = Math.max(700, ...nodes.map((node) => node.position_y + 190));
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="chat-scroll overflow-auto">
      <div
        className="relative bg-[radial-gradient(circle,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:26px_26px]"
        style={{ width, height }}
      >
        <svg className="absolute inset-0 h-full w-full">
          {edges.map((edge) => {
            const source = byId.get(edge.source_node_id);
            const target = byId.get(edge.target_node_id);
            if (!source || !target) return null;
            const x1 = source.position_x + 278;
            const y1 = source.position_y + 72;
            const x2 = target.position_x;
            const y2 = target.position_y + 72;
            const mid = x1 + Math.max(80, (x2 - x1) / 2);
            return (
              <path
                key={edge.id}
                d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={edge.source_handle.includes("button:1") ? "#7B61FF" : "#00D1FF"}
                strokeOpacity="0.78"
                strokeWidth="2.5"
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={`absolute w-[278px] touch-none rounded-3xl border p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,.35)] transition ${
              selectedId === node.id
                ? "border-cyan-300/70 bg-[#132335]"
                : "border-white/12 bg-[#101720]/96 hover:border-cyan-300/35"
            }`}
            style={{ left: node.position_x, top: node.position_y }}
            onPointerDown={(event) => onDragStart(event, node)}
            onClick={() => onSelect(node.id)}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">
                <GitBranch size={13} />
                {node.type}
              </span>
              <span className="text-xs text-[#A9B4C3]">arraste</span>
            </div>
            <p className="line-clamp-2 font-black text-white">{node.title}</p>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#A9B4C3]">
              {String(node.config.message_text ?? node.config.caption ?? node.config.final_message ?? "Configure este bloco")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function NodePanel({
  node,
  nodes,
  edgeMap,
  flow,
  products,
  onPatch,
  onConfig,
  onConnect,
  onDuplicate,
  onDelete,
  onStart,
}: {
  node: FlowNode | null;
  nodes: FlowNode[];
  edgeMap: Map<string, FlowEdge>;
  flow: Flow;
  products: Product[];
  onPatch: (id: string, patch: Partial<FlowNode>) => void;
  onConfig: (id: string, patch: Record<string, unknown>) => void;
  onConnect: (sourceNodeId: string, sourceHandle: string, targetNodeId: string) => void;
  onDuplicate: (node: FlowNode) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
}) {
  if (!node) {
    return (
      <Panel title="Editor do no" icon={Bot}>
        <p className="text-sm text-[#A9B4C3]">Selecione ou crie um no.</p>
      </Panel>
    );
  }

  const primaryTarget = edgeMap.get(`${node.id}:button:0`)?.target_node_id ?? "";
  const secondaryTarget = edgeMap.get(`${node.id}:button:1`)?.target_node_id ?? "";
  const nextTarget = edgeMap.get(`${node.id}:next`)?.target_node_id ?? "";
  const finalTarget = edgeMap.get(`${node.id}:final`)?.target_node_id ?? "";
  const successTarget = edgeMap.get(`${node.id}:success`)?.target_node_id ?? "";

  return (
    <Panel title="Editor do no" icon={MousePointerClick}>
      <div className="flex gap-2">
        <NeonButton type="button" variant="secondary" className="flex-1" onClick={() => onDuplicate(node)}>
          <Copy size={15} />
          Duplicar
        </NeonButton>
        <NeonButton type="button" variant="danger" className="flex-1" onClick={() => onDelete(node.id)}>
          <Trash2 size={15} />
          Excluir
        </NeonButton>
      </div>
      <Input label="Titulo interno" value={node.title} onChange={(title) => onPatch(node.id, { title })} />
      <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
        Tipo
        <select
          className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
          value={node.type}
          onChange={(event) =>
            onPatch(node.id, {
              type: event.target.value as FlowNodeType,
              config: defaultConfig(event.target.value as FlowNodeType, flow.product_id),
            })
          }
        >
          {nodeTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      {flow.start_node_id === node.id ? (
        <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
          Este e o inicio publicado do fluxo.
        </p>
      ) : (
        <NeonButton type="button" variant="secondary" className="w-full" onClick={() => onStart(node.id)}>
          Definir como inicio
        </NeonButton>
      )}

      {["text_message", "button_message"].includes(node.type) ? (
        <Textarea
          label="Mensagem"
          value={String(node.config.message_text ?? "")}
          rows={6}
          onChange={(message_text) => onConfig(node.id, { message_text })}
        />
      ) : null}
      {node.type === "media_message" ? (
        <>
          <Input label="URL da midia" value={String(node.config.media_url ?? "")} onChange={(media_url) => onConfig(node.id, { media_url })} />
          <Textarea label="Legenda" value={String(node.config.caption ?? "")} onChange={(caption) => onConfig(node.id, { caption })} />
        </>
      ) : null}
      {node.type === "faq" ? (
        <>
          <Textarea
            label="FAQ em JSON"
            value={JSON.stringify(node.config.faqs ?? [], null, 2)}
            rows={8}
            onChange={(value) => onConfig(node.id, { faqs: safeJson(value, []) })}
          />
          <Input label="Botao final" value={String(node.config.final_button_text ?? "")} onChange={(final_button_text) => onConfig(node.id, { final_button_text })} />
          <StepSelect label="Destino do botao final" nodes={nodes} currentId={node.id} value={finalTarget || String(node.config.final_button_target_node_id ?? "")} onChange={(target) => {
            onConnect(node.id, "final", target);
            onConfig(node.id, { final_button_target_node_id: target || null });
          }} />
        </>
      ) : null}
      {node.type === "checkout" ? (
        <>
          <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
            Produto
            <select
              className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
              value={String(node.config.product_id ?? flow.product_id)}
              onChange={(event) => onConfig(node.id, { product_id: event.target.value })}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <Input label="Titulo do resumo" value={String(node.config.summary_title ?? "")} onChange={(summary_title) => onConfig(node.id, { summary_title })} />
          <Input label="Texto do botao" value={String(node.config.button_text ?? "")} onChange={(button_text) => onConfig(node.id, { button_text })} />
        </>
      ) : null}
      {node.type === "pix_payment" ? (
        <>
          <Textarea label="Texto pendente" value={String(node.config.pending_text ?? "")} rows={5} onChange={(pending_text) => onConfig(node.id, { pending_text })} />
          <StepSelect label="Destino se pago" nodes={nodes} currentId={node.id} value={successTarget || String(node.config.success_target_node_id ?? "")} onChange={(target) => {
            onConnect(node.id, "success", target);
            onConfig(node.id, { success_target_node_id: target || null });
          }} />
        </>
      ) : null}
      {node.type === "delivery" ? (
        <>
          <Input label="Botao suporte" value={String(node.config.support_button_text ?? "")} onChange={(support_button_text) => onConfig(node.id, { support_button_text })} />
          <Input label="Botao comprar novamente" value={String(node.config.buy_again_button_text ?? "")} onChange={(buy_again_button_text) => onConfig(node.id, { buy_again_button_text })} />
        </>
      ) : null}
      {node.type === "end" ? (
        <Textarea label="Mensagem final" value={String(node.config.final_message ?? "")} onChange={(final_message) => onConfig(node.id, { final_message })} />
      ) : null}

      {node.type === "button_message" ? (
        <ButtonConnections
          node={node}
          nodes={nodes}
          primaryTarget={primaryTarget}
          secondaryTarget={secondaryTarget}
          onConfig={onConfig}
          onConnect={onConnect}
        />
      ) : null}
      {["start", "text_message", "media_message", "checkout"].includes(node.type) ? (
        <StepSelect
          label="Proximo no"
          nodes={nodes}
          currentId={node.id}
          value={nextTarget || String(node.config.next_node_id ?? "")}
          onChange={(target) => {
            onConnect(node.id, "next", target);
            onConfig(node.id, { next_node_id: target || null });
          }}
        />
      ) : null}
    </Panel>
  );
}

function ButtonConnections({
  node,
  nodes,
  primaryTarget,
  secondaryTarget,
  onConfig,
  onConnect,
}: {
  node: FlowNode;
  nodes: FlowNode[];
  primaryTarget: string;
  secondaryTarget: string;
  onConfig: (id: string, patch: Record<string, unknown>) => void;
  onConnect: (sourceNodeId: string, sourceHandle: string, targetNodeId: string) => void;
}) {
  const buttons = Array.isArray(node.config.buttons)
    ? (node.config.buttons as Array<Record<string, unknown>>)
    : [];
  const first = buttons[0] ?? { label: "Continuar", action_type: "go_to_node" };
  const second = buttons[1] ?? { label: "", action_type: "go_to_node" };

  function updateButton(index: number, patch: Record<string, unknown>) {
    const next = [...buttons];
    next[index] = { ...(next[index] ?? { action_type: "go_to_node" }), ...patch };
    onConfig(node.id, { buttons: next });
  }

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 bg-[#0D141C] p-4">
      <p className="font-bold text-white">Botoes e conexoes</p>
      <Input label="Botao 1" value={String(first.label ?? "")} onChange={(label) => updateButton(0, { label })} />
      <ActionSelect value={String(first.action_type ?? "go_to_node")} onChange={(action_type) => updateButton(0, { action_type })} />
      <StepSelect label="Destino botao 1" nodes={nodes} currentId={node.id} value={primaryTarget || String(first.target_node_id ?? "")} onChange={(target) => {
        onConnect(node.id, "button:0", target);
        updateButton(0, { target_node_id: target || null });
      }} />
      <Input label="Botao 2 opcional" value={String(second.label ?? "")} onChange={(label) => updateButton(1, { label })} />
      <ActionSelect value={String(second.action_type ?? "go_to_node")} onChange={(action_type) => updateButton(1, { action_type })} />
      <StepSelect label="Destino botao 2" nodes={nodes} currentId={node.id} value={secondaryTarget || String(second.target_node_id ?? "")} onChange={(target) => {
        onConnect(node.id, "button:1", target);
        updateButton(1, { target_node_id: target || null });
      }} />
    </div>
  );
}

function PreviewPanel({ nodes, flow }: { nodes: FlowNode[]; flow: Flow }) {
  const start = nodes.find((node) => node.id === flow.start_node_id) ?? nodes[0];
  return (
    <Panel title="Teste rapido" icon={Play}>
      <div className="rounded-[28px] border border-white/10 bg-black/30 p-3">
        <div className="mx-auto min-h-[460px] max-w-[260px] rounded-[30px] border border-white/10 bg-[#0B0F14] p-3">
          <p className="text-xs font-bold text-cyan-100">Preview mobile</p>
          <div className="mt-3 rounded-2xl bg-white/[0.08] p-3 text-xs leading-5 text-white">
            {String(start?.config.message_text ?? "O fluxo comeca aqui.")}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Bot;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,.22)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100">
          <Icon size={18} />
        </div>
        <h3 className="font-black text-white">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
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
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white outline-none focus:border-cyan-300/45"
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

function StepSelect({
  label,
  nodes,
  currentId,
  value,
  onChange,
}: {
  label: string;
  nodes: FlowNode[];
  currentId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      {label}
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sem destino</option>
        {nodes
          .filter((node) => node.id !== currentId)
          .map((node) => (
            <option key={node.id} value={node.id}>
              {node.title} - {node.type}
            </option>
          ))}
      </select>
    </label>
  );
}

function ActionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#A9B4C3]">
      Acao
      <select
        className="min-h-11 rounded-2xl border border-white/10 bg-[#111820] px-4 text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="go_to_node">Ir para no</option>
        <option value="open_checkout">Abrir checkout</option>
        <option value="open_faq">Abrir FAQ</option>
        <option value="open_support">Abrir suporte</option>
        <option value="external_link">Link externo</option>
      </select>
    </label>
  );
}

function defaultConfig(type: FlowNodeType, productId?: string): Record<string, unknown> {
  const product_id = productId ?? "";
  const configs: Record<FlowNodeType, Record<string, unknown>> = {
    start: { name: "Inicio", next_node_id: null },
    text_message: {
      message_text: "Nova mensagem",
      delay_ms: 600,
      show_typing: true,
      typing_duration_ms: 700,
      avatar_visible: true,
      next_node_id: null,
    },
    button_message: {
      message_text: "Escolha uma opcao:",
      delay_ms: 600,
      show_typing: true,
      buttons: [{ label: "Continuar", action_type: "go_to_node", target_node_id: null }],
    },
    media_message: {
      media_type: "image",
      media_url: "",
      caption: "",
      buttons: [],
      next_node_id: null,
    },
    input: {
      label: "Seu nome",
      placeholder: "Digite aqui",
      input_type: "text",
      required: true,
      variable_name: "name",
      validation_rules: {},
      next_node_id: null,
    },
    condition: { conditions: [], default_target_node_id: null },
    faq: { faqs: [], final_button_text: "Continuar", final_button_target_node_id: null },
    checkout: {
      product_id,
      required_fields: ["name", "email", "whatsapp"],
      summary_title: "Resumo da compra",
      summary_text: "Entrega dentro da conversa apos confirmacao.",
      button_text: "Gerar Pix",
      next_node_id: null,
    },
    pix_payment: {
      payment_provider: "mock",
      expiration_minutes: 30,
      success_target_node_id: null,
      expired_target_node_id: null,
      pending_text: "Pix gerado.",
      button_paid_text: "Ja paguei",
    },
    wait_payment: {
      order_id_variable: "order_id",
      polling_interval_seconds: 5,
      timeout_minutes: 30,
      paid_target_node_id: null,
      expired_target_node_id: null,
      pending_target_node_id: null,
    },
    delivery: {
      product_id,
      delivery_template: "",
      support_button_text: "Preciso de suporte",
      buy_again_button_text: "Comprar outro acesso",
    },
    support: {
      support_type: "email",
      support_url: "mailto:suporte@chatfy.local",
      prefilled_message: "",
      create_ticket: false,
    },
    action: { action_type: "notify_admin", payload: {}, next_node_id: null },
    redirect: { url: "", delay_ms: 300 },
    end: { final_message: "Obrigado." },
  };
  return configs[type];
}

function safeJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fallback;
  }
}
