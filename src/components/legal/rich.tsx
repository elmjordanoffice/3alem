import type * as React from "react";
import Link from "next/link";

/**
 * A tiny inline renderer for the long-form legal copy, which lives in the
 * `legal` messages and is read with `t.raw` (no ICU parsing):
 *
 * - `{name}`          → a value from `vars` (text, a link or a placeholder)
 * - `[label](/path)`  → a link (internal paths use next/link; mailto and https too)
 * - `**words**`       → strong emphasis
 *
 * Anything else is plain text, so translators only need these three marks.
 */
export type RichVars = Record<string, React.ReactNode>;

const TOKEN = /\{(\w+)\}|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export const linkClass = "font-medium text-accent-text underline decoration-accent-text/40 underline-offset-4 transition-colors hover:decoration-accent-text";

export function RichLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={linkClass}>
      {children}
    </a>
  );
}

export function rich(text: string, vars: RichVars = {}): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const key = `r${i++}`;
    if (m[1] !== undefined) {
      out.push(<span key={key}>{m[1] in vars ? vars[m[1]] : m[0]}</span>);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      out.push(
        <RichLink key={key} href={m[3]}>
          {m[2]}
        </RichLink>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <strong key={key} className="font-semibold text-text">
          {m[4]}
        </strong>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** A value the owner still has to fill in: visible, never mistaken for real text. */
export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded-[6px] bg-warning-subtle px-1.5 py-0.5 font-medium text-warning [box-decoration-break:clone]">{children}</span>;
}
