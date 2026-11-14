/** Pure fairness arithmetic (no I/O), shared by the dashboard and tests. */

export const FAIRNESS_FIELDS = ["gender", "ageBand", "disability", "firstLanguage"] as const;
export type FairnessField = (typeof FAIRNESS_FIELDS)[number];
/** Groups smaller than this are never shown, to protect individuals. */
export const MIN_GROUP = 5;
/** The four-fifths rule: a selection rate below 80% of the highest group's is flagged. */
export const IMPACT_THRESHOLD = 0.8;

export const FIT_LEVELS = ["STRONG", "GOOD", "PARTIAL", "WEAK"] as const;
export type FitLevel = (typeof FIT_LEVELS)[number];
/** Which fit counts as "selected" for adverse-impact monitoring. */
export type FairnessCutoff = "GOOD" | "PARTIAL";

export interface FairnessGroup {
  /** Count of each role-fit level in the group. */
  distribution: Record<FitLevel, number>;
  value: string;
  n: number;
  selectionRate: number;
  meanMargin: number;
  impactRatio: number | null;
  flagged: boolean;
}

export type FairnessRow = Partial<Record<FairnessField, string | null>> & { roleFit: string; margin: number | null };

/** Selection rate = share at or above the cutoff fit. Groups under MIN_GROUP are suppressed, not shown. */
export function aggregateFairness(rows: FairnessRow[], cutoff: FairnessCutoff = "GOOD") {
  const passes = (fit: string) => FIT_LEVELS.indexOf(fit as FitLevel) !== -1 && FIT_LEVELS.indexOf(fit as FitLevel) <= FIT_LEVELS.indexOf(cutoff);
  const byField = Object.fromEntries(
    FAIRNESS_FIELDS.map((field) => {
      const groups = new Map<string, { n: number; selected: number; margin: number; distribution: Record<FitLevel, number> }>();
      for (const r of rows) {
        const v = r[field];
        if (!v) continue;
        const g = groups.get(v) ?? { n: 0, selected: 0, margin: 0, distribution: { STRONG: 0, GOOD: 0, PARTIAL: 0, WEAK: 0 } };
        g.n++;
        if (passes(r.roleFit)) g.selected++;
        if (r.roleFit in g.distribution) g.distribution[r.roleFit as FitLevel]++;
        g.margin += r.margin ?? 0;
        groups.set(v, g);
      }
      const shown = [...groups.entries()].filter(([, g]) => g.n >= MIN_GROUP);
      const suppressed = [...groups.values()].filter((g) => g.n < MIN_GROUP).reduce((a, g) => a + g.n, 0);
      const best = Math.max(0, ...shown.map(([, g]) => g.selected / g.n));
      const list: FairnessGroup[] = shown.map(([value, g]) => {
        const rate = g.selected / g.n;
        const ratio = best > 0 ? rate / best : null;
        return { value, n: g.n, distribution: g.distribution, selectionRate: rate, meanMargin: g.margin / g.n, impactRatio: ratio, flagged: ratio !== null && ratio < IMPACT_THRESHOLD };
      });
      return [field, { groups: list.sort((a, b) => b.n - a.n), suppressed }];
    }),
  ) as Record<FairnessField, { groups: FairnessGroup[]; suppressed: number }>;
  return { total: rows.length, byField };
}

export function pearson(pairs: readonly (readonly [number, number])[]): number | null {
  const n = pairs.length;
  if (n < 2) return null;
  const mx = pairs.reduce((a, p) => a + p[0], 0) / n;
  const my = pairs.reduce((a, p) => a + p[1], 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}
