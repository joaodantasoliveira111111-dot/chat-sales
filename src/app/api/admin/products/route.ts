import { NextResponse } from "next/server";
import { listProducts, saveProduct } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ products: await listProducts() });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const product = await saveProduct(await request.json());
    return NextResponse.json({ product });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
