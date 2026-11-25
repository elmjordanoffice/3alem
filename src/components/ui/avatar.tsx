import { cn, initials } from "@/lib/utils";

// Night: violet, blue, teal and coral discs, each a soft gradient with white initials.
const TONES = [
  "bg-[linear-gradient(140deg,#7d6cf0,#5847d6)] text-white",
  "bg-[linear-gradient(140deg,#2f4fb8,#162d73)] text-white",
  "bg-[linear-gradient(140deg,#25b3a5,#13877c)] text-white",
  "bg-[linear-gradient(140deg,#ff6f8c,#d6345d)] text-white",
  "bg-[linear-gradient(140deg,#9b8cff,#6c5ce7)] text-white",
];

function toneFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return TONES[hash % TONES.length];
}

/** Initials avatar. Characters in scenarios never get photos. */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold uppercase",
        size === "sm" && "size-6 text-[10px]",
        size === "md" && "size-8 text-xs",
        size === "lg" && "size-10 text-sm",
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Name + role next to an avatar, as used for the scenario cast. */
export function Person({ name, role, size = "md" }: { name: string; role?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <Avatar name={name} size={size} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-text">{name}</span>
        {role ? <span className="truncate text-xs text-secondary">{role}</span> : null}
      </span>
    </span>
  );
}
