import { describe, expect, it } from "vitest";
import { arcPath, castIn, sceneArt } from "@/lib/brand/scene-art";

describe("scene art", () => {
  it("is deterministic and differs between scenes", () => {
    expect(sceneArt("The afternoon queue")).toEqual(sceneArt("The afternoon queue"));
    expect(sceneArt("The afternoon queue")).not.toEqual(sceneArt("Splitting the improvement budget"));
  });

  it("sweeps bold open arcs round the pupil, which stays inside the box", () => {
    for (const seed of ["a", "The afternoon queue", "طابور ما بعد الظهر", "x".repeat(40)]) {
      const a = sceneArt(seed);
      expect(a.sweeps.length).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < a.sweeps.length; i++) {
        const s = a.sweeps[i]!;
        expect(s.cx).toBe(a.dot.cx);
        expect(s.cy).toBe(a.dot.cy);
        // Open: never a full circle, never a sliver.
        expect(s.end - s.start).toBeGreaterThan(180);
        expect(s.end - s.start).toBeLessThan(330);
        if (i > 0) {
          expect(s.r).toBeGreaterThan(a.sweeps[i - 1]!.r);
          expect(s.w).toBeLessThan(a.sweeps[i - 1]!.w);
        }
      }
      expect(a.dot.cx).toBeGreaterThan(40);
      expect(a.dot.cx).toBeLessThan(320);
      expect(a.dot.cy).toBeGreaterThan(40);
      expect(a.dot.cy).toBeLessThan(160);
      expect(a.field.length).toBeGreaterThan(10);
      expect(arcPath(a.sweeps[0]!)).toMatch(/^M[\d.-]+ [\d.-]+A/);
    }
  });

  it("finds the cast named in a scenario, in order", () => {
    const cast = [{ name: "Leila Haddad", role: "Head of Operations" }, { name: "Tomás Rivera", role: "Coordinator" }, { name: "Grace Mensah", role: "Coordinator" }];
    expect(castIn("Tomás asked Leila Haddad for numbers.", cast).map((c) => c.name)).toEqual(["Tomás Rivera", "Leila Haddad"]);
    expect(castIn("Nobody here.", cast)).toEqual([]);
  });
});
