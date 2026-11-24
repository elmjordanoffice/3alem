import { cn } from "@/lib/utils";

/**
 * The pill that opens each section: the section's number in a violet chip,
 * then its name, on a lifted surface.
 */
export function SectionHead({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <p className={cn("r-pill r-label", className)}>
      <span className="r-chip r-index" aria-hidden>
        {index}
      </span>
      {label}
    </p>
  );
}
