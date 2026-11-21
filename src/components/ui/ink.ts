/**
 * Button tones for ink surfaces (the sidebar, the landing hero, the Home brief).
 * On ink the primary action is the signal: ink text on vermilion.
 * Plain strings so server and client components can both use them.
 */
export const INK_PRIMARY = "bg-[var(--signal)] text-[var(--signal-foreground)] font-semibold hover:bg-[var(--signal-hover)] active:scale-[0.98]";
export const INK_SECONDARY =
  "border border-ink-foreground/20 bg-ink-foreground/5 text-ink-foreground hover:bg-ink-foreground/10 active:bg-ink-foreground/15";
export const INK_GHOST = "text-ink-secondary hover:bg-ink-foreground/10 hover:text-ink-foreground active:bg-ink-foreground/15";
