"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** A select that writes its value to one URL search parameter. */
export function QuerySelect({ param, value, options, label, className }: { param: string; value: string; options: { value: string; label: string }[]; label: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const next = new URLSearchParams(search.toString());
        if (v === "all") next.delete(param);
        else next.set(param, v);
        next.delete("cursor");
        router.push(`${pathname}${next.size ? `?${next}` : ""}`);
      }}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
