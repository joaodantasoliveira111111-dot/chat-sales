import { NextResponse } from "next/server";
import { listProducts, saveInventoryItem } from "@/lib/data/store";
import { jsonError, requireAdmin } from "@/lib/api";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { csv } = (await request.json()) as { csv?: string };
    if (!csv) return jsonError("CSV vazio.");

    const products = await listProducts();
    const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((value) => value.trim());
    const created = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const values = line.split(",").map((value) => value.trim());
      const row = Object.fromEntries(headers.map((key, index) => [key, values[index] ?? ""]));
      const product = products.find((item) => item.slug === row.product_slug) ?? products[0];
      if (!product) continue;
      created.push(
        await saveInventoryItem({
          product_id: product.id,
          title: `${product.name} - importado`,
          access_email: row.email,
          access_password: row.password,
          access_url: row.access_url || null,
          extra_instructions: row.extra_instructions || null,
          status: "available",
        }),
      );
    }

    return NextResponse.json({ imported: created.length, items: created });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Falha na importacao.");
  }
}
