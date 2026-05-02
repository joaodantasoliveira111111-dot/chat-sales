import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, requireAdmin } from "@/lib/api";
import { getAppearanceSettings, saveAppearanceSettings } from "@/lib/data/store";

const appearanceSchema = z.object({
  productId: z.string().min(1),
  settings: z.object({
    publicOfferName: z.string().min(1),
    publicSubtitle: z.string().min(1),
    template: z.enum(["dark_premium", "whatsapp_inspired", "instagram_dm", "minimal_chat"]),
    avatarUrl: z.string().nullable().optional(),
    showHeader: z.boolean(),
    showTopSupport: z.boolean(),
    showMicroCredibility: z.boolean(),
    microCredibilityText: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    background: z.string(),
    bubbleStyle: z.enum(["rounded", "compact", "soft"]),
    buttonStyle: z.enum(["gradient", "solid", "outline"]),
    font: z.enum(["geist", "inter", "system"]),
  }),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const productId = new URL(request.url).searchParams.get("product_id");
    if (!productId) return jsonError("Produto obrigatorio.", 422);
    return NextResponse.json({ settings: await getAppearanceSettings(productId) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro.", 401);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const payload = appearanceSchema.parse(await request.json());
    const settings = await saveAppearanceSettings(payload.productId, payload.settings);
    return NextResponse.json({ settings });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao salvar aparencia.");
  }
}
