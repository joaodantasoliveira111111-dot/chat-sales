import { NextResponse } from "next/server";
import { listFaqs, saveFaq } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const productId = new URL(request.url).searchParams.get("product_id") ?? undefined;
    return NextResponse.json({ faqs: await listFaqs(productId) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const faq = await saveFaq(await request.json());
    return NextResponse.json({ faq });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar.");
  }
}
