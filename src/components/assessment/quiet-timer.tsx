"use client";
import * as React from "react";
import { Clock, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

/**
 * A quiet timer, shown only on timed tasks. It never flashes or turns red.
 * It can be hidden. Screen readers hear it only at 5 and 1 minutes left.
 */
export function QuietTimer({
  deadline,
  onExpire,
  className,
  now: nowOverride,
}: {
  /** Epoch ms when time runs out. */
  deadline: number;
  onExpire?: () => void;
  className?: string;
  /** For the design gallery and tests. */
  now?: number;
}) {
  const t = useTranslations("components.timer");
  const n = useNumbers();
  const [now, setNow] = React.useState(() => nowOverride ?? Date.now());
  const [hidden, setHidden] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const fired = React.useRef<Set<number>>(new Set());

  React.useEffect(() => {
    if (nowOverride !== undefined) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [nowOverride]);

  const remaining = Math.max(0, Math.round((deadline - now) / 1000));

  React.useEffect(() => {
    for (const mark of [300, 60]) {
      if (remaining <= mark && remaining > mark - 2 && !fired.current.has(mark)) {
        fired.current.add(mark);
        setAnnounce(t("minutesLeft", { count: mark / 60, formatted: n.number(mark / 60) }));
      }
    }
    if (remaining === 0 && !fired.current.has(0)) {
      fired.current.add(0);
      onExpire?.();
    }
  }, [remaining, onExpire, t, n]);

  const low = remaining <= 120;

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-sm text-secondary", className)}>
      <Clock className="size-4 text-tertiary" strokeWidth={1.75} aria-hidden />
      {hidden ? (
        <span className="text-tertiary">{t("hidden")}</span>
      ) : (
        <span className="tabular" aria-label={t("remaining", { time: n.duration(remaining) })}>
          {low ? t("lowLeft", { time: n.duration(remaining) }) : n.duration(remaining)}
        </span>
      )}
      <button
        type="button"
        onClick={() => setHidden((h) => !h)}
        aria-label={hidden ? t("show") : t("hide")}
        className="inline-flex size-7 items-center justify-center rounded-lg text-tertiary hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
      >
        {hidden ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
      </button>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
