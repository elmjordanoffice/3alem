import { timingSafeEqual } from "node:crypto";
import { retentionSweep } from "@/lib/retention";

/** For an external scheduler: POST with `Authorization: Bearer $CRON_SECRET`. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const result = await retentionSweep();
  return Response.json(result);
}
