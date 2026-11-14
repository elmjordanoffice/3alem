import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, letting later classes win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initials for avatars: "Lina Haddad" → "LH". Works for Arabic names too. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  const a = Array.from(first)[0] ?? "";
  const b = Array.from(last)[0] ?? "";
  // A zero-width non-joiner keeps Arabic initials as separate letters (ل‌ح, not لح).
  const joiner = /[\u0600-\u06FF]/.test(a + b) ? "\u200C" : "";
  return b ? `${a}${joiner}${b}` : a;
}

/** URL-safe slug from a name, with a short random suffix to keep it unique. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "org"}-${suffix}`;
}
