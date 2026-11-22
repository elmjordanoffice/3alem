import { timingSafeEqual } from "node:crypto";
import { sendRepReminders } from "@/lib/grow/reminders";

/** For an external scheduler, every hour: POST with `Authorization: Bearer $CRON_SECRET`. Sends the opt-in Grow reminders due this hour. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await sendRepReminders());
}
