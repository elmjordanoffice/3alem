import "server-only";
import { z } from "zod";
import type { Tx } from "@/lib/db";

/** Organisation competency library: sub-skills an organisation adds to the built-in framework. */
const pair = z.object({ en: z.string().trim().min(1).max(400), ar: z.string().trim().max(400).optional().default("") });
export const libraryEntrySchema = z.object({
  id: z.string().optional(),
  domain: z.string().min(1).max(40),
  name: pair,
  description: pair,
  anchors: z.array(pair).length(5),
});
export type LibraryEntryInput = z.input<typeof libraryEntrySchema>;

export interface LibraryEntry {
  id: string;
  key: string;
  domain: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  anchors: { en: string; ar: string }[];
  isActive: boolean;
  version: number;
}

type Pair = { en: string; ar: string };
const withFallback = (p: { en: string; ar?: string }): Pair => ({ en: p.en, ar: p.ar?.trim() ? p.ar : p.en });

export async function listLibrary(tx: Tx, organizationId: string): Promise<LibraryEntry[]> {
  const rows = await tx.competency.findMany({ where: { organizationId }, include: { domain: { select: { key: true } } }, orderBy: [{ isActive: "desc" }, { createdAt: "asc" }] });
  return rows.map((r) => {
    const anchors = r.anchors as Record<string, Pair>;
    return { id: r.id, key: r.key, domain: r.domain.key, name: r.name as Pair, description: r.description as Pair, anchors: [1, 2, 3, 4, 5].map((l) => anchors[String(l)] ?? { en: "", ar: "" }), isActive: r.isActive, version: r.version };
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "skill";
}

/** Create or edit an entry. Edits bump the version so reports can say which definition they used. */
export async function saveLibraryEntry(tx: Tx, organizationId: string, input: LibraryEntryInput) {
  const d = libraryEntrySchema.parse(input);
  const domain = await tx.competencyDomain.findFirst({ where: { key: d.domain, organizationId: null } });
  if (!domain) throw new Error("Unknown domain");
  const data = {
    domainId: domain.id,
    name: withFallback(d.name),
    description: withFallback(d.description),
    anchors: Object.fromEntries(d.anchors.map((a, i) => [String(i + 1), withFallback(a)])),
  };
  if (d.id) {
    const existing = await tx.competency.findFirst({ where: { id: d.id, organizationId } });
    if (!existing) throw new Error("Not found");
    return tx.competency.update({ where: { id: d.id }, data: { ...data, version: existing.version + 1 } });
  }
  let key = `org.${slug(d.name.en)}`;
  for (let i = 2; await tx.competency.findFirst({ where: { organizationId, key } }); i++) key = `org.${slug(d.name.en)}-${i}`;
  const order = await tx.competency.count({ where: { organizationId } });
  return tx.competency.create({ data: { ...data, organizationId, key, order: 100 + order } });
}

/** The entry as a role skill for an assessment template. */
export function libraryEntryAsSkill(e: LibraryEntry, locale: "en" | "ar") {
  return { key: e.key, domain: e.domain, name: e.name[locale] || e.name.en, description: e.description[locale] || e.description.en, anchors: e.anchors.map((a) => a[locale] || a.en) };
}
