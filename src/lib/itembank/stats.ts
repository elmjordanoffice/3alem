import "server-only";
import { systemDb } from "@/lib/db";
import { BANK } from "./index";

export interface BankItemStats {
  id: string;
  type: string;
  difficulty: number;
  targets: string[];
  roleFamilies: string[];
  uses: number;
  meanLevel: number | null;
  sdLevel: number | null;
  tieBreakRate: number | null;
  status: "active" | "retired";
  note: string | null;
  flags: ("notDiscriminating" | "tooEasy" | "tooHard" | "scorersDisagree")[];
}

/** Minimum uses before an item's statistics are trusted enough to flag. */
export const MIN_USES_FOR_FLAGS = 8;

/**
 * How each curated item performs in live use: how often it is used, the
 * spread of scores it produces (an item everyone scores the same on tells us
 * nothing) and how often scorers disagreed enough to need a third pass.
 */
export async function bankItemStats(): Promise<BankItemStats[]> {
  const rows = await systemDb.$queryRaw<{ id: string; uses: bigint; mean: number | null; sd: number | null; finals: bigint; tiebreaks: bigint }[]>`
    SELECT substring(i."promptVersion" from 6) AS id,
           count(DISTINCT i.id) FILTER (WHERE i.status = 'ANSWERED') AS uses,
           avg(s.level) FILTER (WHERE s."isFinal") AS mean,
           stddev_samp(s.level) FILTER (WHERE s."isFinal") AS sd,
           count(*) FILTER (WHERE s."isFinal") AS finals,
           count(*) FILTER (WHERE s.pass = 3) AS tiebreaks
    FROM item i LEFT JOIN item_score s ON s."itemId" = i.id
    WHERE i."promptVersion" LIKE 'bank:%'
    GROUP BY 1`;
  const reviews = await systemDb.bankItemReview.findMany();
  const byId = new Map(rows.map((r) => [r.id, r]));
  const review = new Map(reviews.map((r) => [r.itemKey, r]));
  return BANK.map((b) => {
    const r = byId.get(b.id);
    const uses = Number(r?.uses ?? 0);
    const finals = Number(r?.finals ?? 0);
    const flags: BankItemStats["flags"] = [];
    if (uses >= MIN_USES_FOR_FLAGS && r) {
      if (r.sd !== null && r.sd < 0.35) flags.push("notDiscriminating");
      if (r.mean !== null && r.mean > 4.3) flags.push("tooEasy");
      if (r.mean !== null && r.mean < 1.7) flags.push("tooHard");
      if (finals > 0 && Number(r.tiebreaks) / finals > 0.25) flags.push("scorersDisagree");
    }
    const rv = review.get(b.id);
    return {
      id: b.id,
      type: b.type,
      difficulty: b.difficulty,
      targets: b.targets,
      roleFamilies: b.roleFamilies,
      uses,
      meanLevel: r?.mean ?? null,
      sdLevel: r?.sd ?? null,
      tieBreakRate: finals ? Number(r!.tiebreaks) / finals : null,
      status: rv?.status === "retired" ? "retired" : "active",
      note: rv?.note ?? null,
      flags,
    };
  });
}

/** Generated (not curated) items over the last 30 days: how many failed the guessability check. */
export async function generatedItemHealth() {
  const since = new Date(Date.now() - 30 * 86400_000);
  const [generated, failed] = await Promise.all([
    systemDb.item.count({ where: { createdAt: { gte: since }, NOT: { promptVersion: { startsWith: "bank:" } } } }),
    systemDb.item.count({ where: { createdAt: { gte: since }, guessabilityStatus: "FAILED" } }),
  ]);
  return { generated, failed };
}
