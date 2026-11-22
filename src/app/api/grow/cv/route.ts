import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth/session";
import { readCv } from "@/lib/grow/cv";
import { WORLDS } from "@/lib/itembank";

/**
 * Turn an uploaded CV (PDF, Word, text or Markdown, up to 5 MB) into plain
 * text for the Grow onboarding form. Nothing is stored here: the person
 * reviews the text and saves it with their profile. Also returns what the
 * reader found, so the form can show it before saving. A JSON body with
 * pasted `text` is read the same way.
 */
const MAX = 5 * 1024 * 1024;

async function toText(file: File): Promise<string | null> {
  const name = file.name.toLowerCase();
  const buf = new Uint8Array(await file.arrayBuffer());
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text;
  }
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return value;
  }
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) return new TextDecoder().decode(buf);
  return null;
}

export async function POST(req: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  // Pasted text: just read it.
  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
    const text = typeof body?.text === "string" ? body.text.slice(0, 40_000) : "";
    return NextResponse.json({ ok: true, text, career: readCv(text, WORLDS) });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  try {
    const raw = await toText(file);
    if (raw === null) return NextResponse.json({ ok: false, error: "unsupported" }, { status: 415 });
    // Tidy: collapse runs of spaces, keep line breaks (titles live on their own lines).
    const text = raw.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, 40_000);
    if (text.length < 40) return NextResponse.json({ ok: false, error: "empty" }, { status: 422 });
    return NextResponse.json({ ok: true, text, career: readCv(text, WORLDS) });
  } catch (e) {
    console.warn("[grow/cv] could not read the file", e);
    return NextResponse.json({ ok: false, error: "unreadable" }, { status: 422 });
  }
}
