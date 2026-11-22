import { describe, expect, it } from "vitest";
import { collection, isNewCard, type PracticeRow } from "@/lib/grow/collection";

const row = (id: string, source: string, at: string, levels: number[]): PracticeRow => ({ id, completedAt: new Date(at), competencyKeys: ["judgment.trade-off-reasoning"], item: { source, content: { title: `Scene ${source}` }, difficulty: 3 }, levels });

describe("scene card collection", () => {
  const rows = [row("p1", "bank:a", "2026-11-18T09:00:00Z", [2]), row("p2", "bank:a", "2026-11-19T09:00:00Z", [4]), row("p3", "bank:b", "2026-11-20T09:00:00Z", [3])];

  it("makes one card per scenario, keeping the best level and the attempts", () => {
    const cards = collection(rows);
    expect(cards.map((c) => c.id)).toEqual(["bank:b", "bank:a"]);
    expect(cards[1]).toMatchObject({ best: 4, attempts: 2 });
  });

  it("knows when a session collected a new card", () => {
    expect(isNewCard(rows, "p1")).toBe(true);
    expect(isNewCard(rows, "p2")).toBe(false);
    expect(isNewCard(rows, "p3")).toBe(true);
  });
});
