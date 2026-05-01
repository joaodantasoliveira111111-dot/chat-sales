import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";
import { trackFunnelEvent } from "@/lib/data/store";

const schema = z.object({
  sessionId: z.string().min(8),
  productId: z.string().min(1),
  eventType: z.enum(["view", "step", "checkout", "pix_generated", "paid"]),
  stepId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await trackFunnelEvent(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Erro ao registrar.");
  }
}
