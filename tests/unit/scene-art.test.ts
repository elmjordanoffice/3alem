import { describe, expect, it } from "vitest";
import { castIn, sceneArt } from "@/lib/brand/scene-art";

describe("scene art", () => {
  it("is deterministic and differs between scenes", () => {
    expect(sceneArt("The afternoon queue")).toEqual(sceneArt("The afternoon queue"));
    expect(sceneArt("The afternoon queue")).not.toEqual(sceneArt("Splitting the improvement budget"));
  });

  it("narrows upward into the dot, inside the box", () => {
    for (const seed of ["a", "The afternoon queue", "طابور ما بعد الظهر", "x".repeat(40)]) {
      const a = sceneArt(seed);
      expect(a.stack.length).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < a.stack.length; i++) {
        expect(a.stack[i]!.w).toBeLessThan(a.stack[i - 1]!.w);
        expect(a.stack[i]!.y).toBeLessThan(a.stack[i - 1]!.y);
      }
      for (const b of a.stack) {
        expect(b.x).toBeGreaterThanOrEqual(0);
        expect(b.x + b.w).toBeLessThanOrEqual(360);
      }
      expect(a.dot.cy).toBeGreaterThan(0);
    }
  });

  it("finds the cast named in a scenario, in order", () => {
    const cast = [{ name: "Leila Haddad", role: "Head of Operations" }, { name: "Tomás Rivera", role: "Coordinator" }, { name: "Grace Mensah", role: "Coordinator" }];
    expect(castIn("Tomás asked Leila Haddad for numbers.", cast).map((c) => c.name)).toEqual(["Tomás Rivera", "Leila Haddad"]);
    expect(castIn("Nobody here.", cast)).toEqual([]);
  });
});
