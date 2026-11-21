import type * as React from "react";

/** A little burst of vermilion dots, once. */
export function Burst({ count = 10, distance = 38, delay = 200 }: { count?: number; distance?: number; delay?: number }) {
  return (
    <span className="joy-burst" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ "--a": `${(360 / count) * i}deg`, "--d": `${distance + (i % 3) * 8}px`, "--delay": `${delay + (i % 2) * 60}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}
