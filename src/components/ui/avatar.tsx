import { cn, initials } from "@/lib/utils";

const TONES = [
  "bg-[#e4e5fb] text-[#2f33ad] dark:bg-[#262849] dark:text-[#b4b6fa]",
  "bg-[#ddf3ef] text-[#0f5e57] dark:bg-[#12302c] dark:text-[#7fe0d2]",
  "bg-[#fbeedd] text-[#8a4209] dark:bg-[#33240f] dark:text-[#f8c77a]",
  "bg-[#f6e4f0] text-[#86275f] dark:bg-[#36182b] dark:text-[#f2b2dc]",
  "bg-[#e8e6e3] text-[#44403c] dark:bg-[#2e2b28] dark:text-[#d6d3d1]",
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
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold uppercase",
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
