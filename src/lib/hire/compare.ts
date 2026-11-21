import type { ReportContent, ReportEvidence } from "./report-types";

/**
 * Where candidates really differ. A difference counts only when the ranges
 * don't overlap (the leader's low end sits above the other's high end) and
 * the gap is at least half a level; with three or four people, the leader is
 * set against the closest person who is still clearly behind; everything else is inside the margin of
 * the measurement and is named as such, so nobody decides on noise. Each
 * clear difference carries one quote from each side, from their own answers.
 */
export interface Side {
  sessionId: string;
  name: string;
  estimate: number;
  quote: string | null;
}

export interface Difference {
  key: string;
  name: string;
  mustHave: boolean;
  gap: number;
  leader: Side;
  trailer: Side;
}

type Compared = { sessionId: string; name: string; content: ReportContent };

function quoteFor(content: ReportContent, ids: string[], pick: "high" | "low"): string | null {
  const ev = ids.map((id) => content.evidence[id]).filter((e): e is ReportEvidence => Boolean(e?.quote?.trim()));
  if (!ev.length) return null;
  ev.sort((a, b) => (pick === "high" ? b.level - a.level : a.level - b.level) || b.confidence - a.confidence);
  const q = ev[0]!.quote.trim().replace(/\s+/g, " ");
  return q.length > 200 ? `${q.slice(0, 197).trimEnd()}…` : q;
}

export function differences(reports: Compared[]): { clear: Difference[]; within: { key: string; name: string }[] } {
  if (reports.length < 2) return { clear: [], within: [] };
  const clear: Difference[] = [];
  const within: { key: string; name: string }[] = [];
  for (const d of reports[0]!.content.domains) {
    const rows = reports
      .map((r) => ({ r, x: r.content.domains.find((y) => y.key === d.key) }))
      .filter((v): v is { r: Compared; x: NonNullable<typeof v.x> } => Boolean(v.x))
      .sort((a, b) => b.x.estimate - a.x.estimate);
    if (rows.length < 2) continue;
    const top = rows[0]!;
    // The closest person who is still clearly behind the leader: the comparison that decides something.
    const bottom = rows.slice(1).find((v) => top.x.range[0] > v.x.range[1] && top.x.estimate - v.x.estimate >= 0.5);
    if (bottom) {
      const gap = Math.round((top.x.estimate - bottom.x.estimate) * 10) / 10;
      clear.push({
        key: d.key,
        name: d.name,
        mustHave: d.importance === "MUST_HAVE",
        gap,
        leader: { sessionId: top.r.sessionId, name: top.r.name, estimate: top.x.estimate, quote: quoteFor(top.r.content, top.x.evidenceIds, "high") },
        trailer: { sessionId: bottom.r.sessionId, name: bottom.r.name, estimate: bottom.x.estimate, quote: quoteFor(bottom.r.content, bottom.x.evidenceIds, "low") },
      });
    } else within.push({ key: d.key, name: d.name });
  }
  clear.sort((a, b) => Number(b.mustHave) - Number(a.mustHave) || b.gap - a.gap);
  return { clear, within };
}
