import { cn, initials } from "@/lib/utils";

// Range: stone, ink and one vermilion tint. Initials are set in the display face.
const TONES = [
  "bg-[#ebe8e1] text-[#141414] dark:bg-[#2a2826] dark:text-[#f2f0eb]",
  "bg-[#141414] text-[#f2f0eb] dark:bg-[#f2f0eb] dark:text-[#141414]",
  "bg-[#ffe8e0] text-[#9e2a0c] dark:bg-[#3b1a10] dark:text-[#ff9472]",
  "bg-[#d2cbbe] text-[#141414] dark:bg-[#4a4641] dark:text-[#f2f0eb]",
  "bg-[#f8f7f4] text-[#4f4b45] shadow-[inset_0_0_0_1px_#e2ded5] dark:bg-[#1e1d1b] dark:text-[#c4bfb5] dark:shadow-[inset_0_0_0_1px_#2d2b28]",
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
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold uppercase [font-stretch:112%]",
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
