/**
 * The range field: rows of estimates narrowing from lavender (uncertain) to
 * saffron (evidenced). A brand texture for hero panels and social images;
 * never used inside the product's data views.
 */
export function RangeField({ width = 480, height = 520, rows = 9, className }: { width?: number; height?: number; rows?: number; className?: string }) {
  const items = Array.from({ length: rows }, (_, i) => {
    const y = (height / (rows + 1)) * (i + 1);
    const spread = 0.62 - i * (0.5 / rows);
    const centre = 0.58 + Math.sin(i * 1.7) * 0.12;
    const lo = Math.max(0.04, centre - spread / 2) * width;
    const hi = Math.min(0.96, centre + spread / 2) * width;
    const t = i / (rows - 1);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
    return { y, lo, hi, t, fill: `rgb(${mix(0x8f, 0xf2)},${mix(0x92, 0xb5)},${mix(0xf7, 0x32)})` };
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      {items.map((r, i) => (
        <g key={i}>
          <rect x={0} y={r.y - 1} width={width} height={2} rx={1} fill="#f5f4ff" opacity={0.1} />
          <rect x={r.lo} y={r.y - 9} width={r.hi - r.lo} height={18} rx={9} fill={r.fill} opacity={0.35 + r.t * 0.65} />
          <circle cx={(r.lo + r.hi) / 2} cy={r.y} r={5} fill="#f5f4ff" opacity={0.35 + r.t * 0.6} />
        </g>
      ))}
    </svg>
  );
}
