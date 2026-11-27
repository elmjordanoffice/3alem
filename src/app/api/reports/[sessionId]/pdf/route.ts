import { NextResponse, type NextRequest } from "next/server";
import { chromium, type Browser } from "playwright-core";
import { getViewer, viewerCan } from "@/lib/auth/session";
import { reportForViewer } from "@/lib/hire/recruiter";
import { reviewForViewer, reviewPending } from "@/lib/hire/review";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * PDF export: render the print page in headless Chromium with the viewer's own
 * session cookies, so the PDF can never contain more than they can see.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.activeOrganization || !viewerCan(viewer, "report.view")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { sessionId } = await params;
  const r = await reportForViewer(viewer, sessionId);
  if (!r?.report?.content) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (reviewPending((await reviewForViewer(viewer, sessionId))?.review)) return NextResponse.json({ error: "review_pending" }, { status: 409 });

  // The public URL, not the request's: behind a TLS proxy the request looks like plain http,
  // and secure session cookies would then be refused by the browser.
  const origin = (process.env.APP_URL || process.env.BETTER_AUTH_URL || req.nextUrl.origin).replace(/\/$/, "");
  let browser: Browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"] });
  } catch (e) {
    // No browser on this host (see docs/deploy.md): the client opens the print page instead.
    console.error("[pdf] Chromium unavailable", e instanceof Error ? e.message.split("\n")[0] : e);
    return NextResponse.json({ error: "pdf_unavailable", print: `/print/reports/${sessionId}?print=1` }, { status: 503 });
  }
  try {
    const context = await browser.newContext({ colorScheme: "light" });
    const cookies = req.cookies.getAll().map((c) => ({ name: c.name, value: c.value, url: origin }));
    await context.addCookies(cookies);
    const page = await context.newPage();
    await page.goto(`${origin}/print/reports/${sessionId}`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" } });
    await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.exported_pdf", targetType: "session", targetId: sessionId });
    return new NextResponse(Buffer.from(pdf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="aalim-report-${sessionId.slice(-6)}.pdf"`, "Cache-Control": "no-store" },
    });
  } finally {
    await browser.close();
  }
}
