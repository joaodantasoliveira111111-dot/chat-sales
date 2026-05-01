import { NextResponse } from "next/server";
import { getProductById, saveProduct } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const product = await getProductById(id);
    if (!product) return jsonError("Produto nao encontrado.", 404);
    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const product = await saveProduct({ ...(await request.json()), id });
    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
