/**
 * Scene art: a small, deterministic composition for each scene's cover card,
 * made only from the brand's own shapes (the ʿAyn, D-063): a coral pupil, the
 * bold open arcs of the letter's bowl sweeping round it, and faint ripples
 * further out, the field of what we haven't looked at yet. The same title
 * always gives the same picture, so a scene looks the same on the web and in
 * the native app, and every scene looks a little different from the last.
 *
 * Pure and dependency-free on purpose: the mobile app uses this file too.
 * Coordinates are in a 360 × 200 box; angles in degrees, SVG-style (0 is to
 * the right, 90 is down).
 */

export interface ArtArc {
  cx: number;
  cy: number;
  r: number;
  /** Start and end angle, drawn clockwise from start to end (end > start). */
  start: number;
  end: number;
  /** Stroke width. */
  w: number;
  /** 0–1: how strongly the arc is drawn (the sweeps are solid, the ripples faint). */
  strength: number;
}

export interface SceneArt {
  width: 360;
  height: 200;
  /** Faint thin ripples round the pupil: the field of what we haven't looked at yet. */
  field: ArtArc[];
  /** Two or three bold open arcs round the pupil, all open on the same side, like the ʿayn's bowl. */
  sweeps: ArtArc[];
  /** The coral pupil. */
  dot: { cx: number; cy: number; r: number };
}

/** An SVG path for an arc (round caps are up to the renderer). */
export function arcPath(a: ArtArc): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x0 = a.cx + a.r * Math.cos(rad(a.start));
  const y0 = a.cy + a.r * Math.sin(rad(a.start));
  const x1 = a.cx + a.r * Math.cos(rad(a.end));
  const y1 = a.cy + a.r * Math.sin(rad(a.end));
  const large = a.end - a.start > 180 ? 1 : 0;
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${a.r} ${a.r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** The length of an arc, for drawing it on. */
export function arcLength(a: ArtArc): number {
  return Math.round(((a.end - a.start) * Math.PI * a.r) / 180);
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

  // The pupil: somewhere in the middle band, never near the edges.
  const dot = { cx: round(90 + r() * 180), cy: round(70 + r() * 60), r: round(8 + r() * 2) };
  // Which way the arcs open (the ʿayn opens to the right; scenes vary it).
  const open = r() * 360;

  // The sweeps: 2–3 bold arcs, each a little wider and a little thinner, all open towards `open`.
  const count = 2 + Math.floor(r() * 2);
  const sweeps: ArtArc[] = [];
  let radius = 24 + r() * 6;
  for (let i = 0; i < count; i++) {
    const span = 210 + r() * 70;
    const jitter = (r() - 0.5) * 30;
    const start = open + jitter + (360 - span) / 2;
    sweeps.push({ cx: dot.cx, cy: dot.cy, r: round(radius), start: round(start), end: round(start + span), w: round(13 - i * 2 + r()), strength: round(1 - i * 0.18) });
    radius += 20 + r() * 8;
  }

  // The field: thin ripples further out, broken into pieces, a few brighter.
  const field: ArtArc[] = [];
  for (let rr = radius + 8; rr < 420; rr += 16 + r() * 10) {
    let a = r() * 360;
    const stop = a + 360;
    while (a < stop - 20) {
      const span = 25 + r() * 110;
      field.push({ cx: dot.cx, cy: dot.cy, r: round(rr), start: round(a), end: round(Math.min(stop, a + span)), w: 2.5, strength: round(0.05 + (r() < 0.12 ? 0.08 : 0) + r() * 0.05) });
      a += span + 14 + r() * 40;
    }
  }
  return { width: W, height: H, field, sweeps, dot };
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
