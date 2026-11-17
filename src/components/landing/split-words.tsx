import { cn } from "@/lib/utils";

/**
 * Masked word reveal. Screen readers get the sentence once (sr-only); the
 * animated words are hidden from them. Words rise in on load, or when their
 * section enters the viewport if an ancestor has `data-reveal`.
 */
export function SplitWords({ text, className, wordClassName, delay = 0 }: { text: string; className?: string; wordClassName?: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="word-mask">
              <span className={cn("word", wordClassName)} style={{ "--i": i, "--d": `${delay}ms` } as React.CSSProperties}>
                {w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
