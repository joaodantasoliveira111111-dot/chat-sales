import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/api";
import { saveFlowGraph } from "@/lib/data/store";

const nodeSchema = z.object({
  id: z.string(),
  flow_id: z.string(),
  type: z.enum([
    "start",
    "text_message",
    "button_message",
    "media_message",
    "input",
    "condition",
    "faq",
    "checkout",
    "pix_payment",
    "wait_payment",
    "delivery",
    "support",
    "action",
    "redirect",
    "end",
  ]),
  title: z.string(),
  position_x: z.number(),
  position_y: z.number(),
  config: z.record(z.string(), z.unknown()),
});

const edgeSchema = z.object({
  id: z.string(),
  flow_id: z.string(),
  source_node_id: z.string(),
  source_handle: z.string(),
  target_node_id: z.string(),
  condition: z.record(z.string(), z.unknown()).nullable(),
});

const graphSchema = z.object({
  flow: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    product_id: z.string(),
    theme_id: z.enum(["dark_premium", "whatsapp_inspired", "instagram_dm", "minimal_chat"]),
    status: z.enum(["draft", "published", "archived"]),
    start_node_id: z.string().nullable(),
  }),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const payload = graphSchema.parse(await request.json());
    const result = await saveFlowGraph({
      ...payload,
      flow: { ...payload.flow, id },
      nodes: payload.nodes.map((node) => ({ ...node, flow_id: id })),
      edges: payload.edges.map((edge) => ({ ...edge, flow_id: id })),
    });
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar grafo.");
  }
}
