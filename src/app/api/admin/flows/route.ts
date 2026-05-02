import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/api";
import { listFlows, saveFlow } from "@/lib/data/store";

const flowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  product_id: z.string().min(1),
  theme_id: z
    .enum(["dark_premium", "whatsapp_inspired", "instagram_dm", "minimal_chat"])
    .default("dark_premium"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  start_node_id: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const productId = new URL(request.url).searchParams.get("product_id") ?? undefined;
    return NextResponse.json({ flows: await listFlows(productId) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const flow = await saveFlow(flowSchema.parse(await request.json()));
    return NextResponse.json({ flow });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar fluxo.");
  }
}
