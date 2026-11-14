import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/session";
import { exportUserData } from "@/lib/privacy";

export const runtime = "nodejs";

/** Download everything Aalim holds about the signed-in person, as JSON. */
export async function GET() {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await exportUserData(viewer.user.id);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="aalim-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
