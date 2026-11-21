/**
 * Scene art: a small, deterministic composition for each scene's cover card,
 * made only from the brand's own shapes (rounded bands narrowing toward the
 * vermilion dot). The same title always gives the same picture, so a scene
 * looks the same on the web and in the native app, and every scene looks a
 * little different from the last.
 *
 * Pure and dependency-free on purpose: the mobile app uses this file too.
 * Coordinates are in a 360 × 200 box.
 */

export interface ArtBand {
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0–1: how strongly the band is drawn (the main stack is solid, the field is faint). */
  strength: number;
}

export interface SceneArt {
  width: 360;
  height: 200;
  /** Faint thin bands behind everything: the "field" of what we don't know yet. */
  field: ArtBand[];
  /** The main stack, widest at the bottom, narrowing up toward the dot. */
  stack: ArtBand[];
  dot: { cx: number; cy: number; r: number };
  /** Degrees; the whole stack leans a little in some scenes. */
  tilt: number;
}

/** FNV-1a, 32-bit. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: small, fast, good enough for pictures. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

export function sceneArt(seed: string): SceneArt {
  const r = rng(hash(seed || "aalim"));
  const W = 360;
  const H = 200;

  // The field: rows of thin bands of random length, a few of them a touch brighter.
  const field: ArtBand[] = [];
  const rows = 9;
  for (let i = 0; i < rows; i++) {
    const y = 14 + i * 20;
    let x = -20 + r() * 30;
    while (x < W) {
      const w = 24 + r() * 90;
      field.push({ x: round(x), y, w: round(w), h: 6, strength: round(0.05 + (r() < 0.12 ? 0.08 : 0) + r() * 0.04) });
      x += w + 10 + r() * 26;
    }
  }

  // The stack: 3–4 bands narrowing upward, anchored start, centre or end; the dot stays well inside the box.
  const count = 3 + Math.floor(r() * 2);
  const anchor = r();
  const baseW = 150 + r() * 70;
  const bandH = 15 + Math.floor(r() * 4);
  const gap = 7 + Math.floor(r() * 3);
  const bottom = H - 22 - r() * 8;
  const stack: ArtBand[] = [];
  let w = baseW;
  for (let i = 0; i < count; i++) {
    const y = bottom - i * (bandH + gap);
    const cx = anchor < 0.34 ? 40 + w / 2 : anchor < 0.67 ? W / 2 : W - 40 - w / 2;
    stack.push({ x: round(cx - w / 2), y: round(y - bandH), w: round(w), h: bandH, strength: round(1 - i * 0.12) });
    w *= 0.58 + r() * 0.14;
  }
  const top = stack[stack.length - 1]!;
  const dot = { cx: round(top.x + top.w / 2), cy: round(top.y - gap - bandH / 2), r: round(bandH / 2 + 1) };
  const tilt = r() < 0.5 ? 0 : round((r() - 0.5) * 10);
  return { width: W, height: H, field, stack, dot, tilt };
}

/** People from the cast who are named in a text, in order of appearance (at most `max`). */
export function castIn(text: string, cast: { name: string; role: string }[], max = 3): { name: string; role: string }[] {
  const found = cast
    .map((c) => ({ c, at: Math.min(...[c.name, c.name.split(" ")[0] ?? c.name].map((n) => (n.length > 2 ? text.indexOf(n) : -1)).filter((i) => i >= 0), Infinity) }))
    .filter((x) => Number.isFinite(x.at))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.c);
  return found.slice(0, max);
}
