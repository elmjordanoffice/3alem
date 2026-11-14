"use client";
import { useNumbers } from "@/components/providers";

export function FormattedNumber({ value, options }: { value: number; options?: Intl.NumberFormatOptions }) {
  const n = useNumbers();
  return <>{n.number(value, options)}</>;
}
