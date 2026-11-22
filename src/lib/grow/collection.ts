/**
 * The collection: every scenario you've practised becomes a card, drawn with
 * its own scene art (src/lib/brand/scene-art.ts), with your best level and
 * how many times you've taken it on. Collecting is a reason to try new
 * scenarios, which is also what widens practice; it never ranks people.
 */
export interface SceneCard {
  /** The scenario's source (a bank id or a generated item), so retries and twists don't make duplicates. */
  id: string;
  title: string;
  industry: string | null;
  skillKey: string;
  best: number;
  attempts: number;
  firstAt: string;
  difficulty: number;
}

export interface PracticeRow {
  id: string;
  completedAt: Date | null;
  competencyKeys: string[];
  item: { source: string; content: { title: string }; difficulty: number; why?: { industry: string | null } | undefined };
  levels: number[];
}

export function collection(rows: PracticeRow[]): SceneCard[] {
  const by = new Map<string, SceneCard>();
  for (const r of [...rows].filter((x) => x.completedAt).sort((a, b) => a.completedAt!.getTime() - b.completedAt!.getTime())) {
    const id = r.item.source || r.id;
    const best = r.levels.length ? Math.max(...r.levels) : 0;
    const prev = by.get(id);
    if (prev) {
      prev.attempts++;
      prev.best = Math.max(prev.best, best);
    } else {
      by.set(id, { id, title: r.item.content.title, industry: r.item.why?.industry ?? null, skillKey: r.competencyKeys[0] ?? "", best, attempts: 1, firstAt: r.completedAt!.toISOString(), difficulty: r.item.difficulty });
    }
  }
  return [...by.values()].sort((a, b) => b.firstAt.localeCompare(a.firstAt));
}

/** Is this practice session the first time its scenario was collected? */
export function isNewCard(rows: PracticeRow[], sessionId: string): boolean {
  const me = rows.find((r) => r.id === sessionId);
  if (!me?.completedAt) return false;
  const id = me.item.source || me.id;
  return !rows.some((r) => r.id !== sessionId && r.completedAt && (r.item.source || r.id) === id && r.completedAt.getTime() < me.completedAt!.getTime());
}
