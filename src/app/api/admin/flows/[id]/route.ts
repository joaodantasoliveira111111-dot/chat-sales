import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/api";
import { getFlowBundle, saveFlow } from "@/lib/data/store";

const patchSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  product_id: z.string().min(1),
  theme_id: z.enum(["dark_premium", "whatsapp_inspired", "instagram_dm", "minimal_chat"]),
  status: z.enum(["draft", "published", "archived"]),
  start_node_id: z.string().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const bundle = await getFlowBundle(id);
    if (!bundle) return jsonError("Fluxo nao encontrado.", 404);
    return NextResponse.json(bundle);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const flow = await saveFlow({ ...patchSchema.parse(await request.json()), id });
    return NextResponse.json({ flow });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
