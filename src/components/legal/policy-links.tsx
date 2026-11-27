import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Policy = "privacy" | "terms" | "ai" | "security";
const HREF: Record<Policy, string> = { privacy: "/privacy", terms: "/terms", ai: "/ai", security: "/security" };

/**
 * Links to the public policy pages for places a person shouldn't leave, such
 * as the candidate's start screen: they open in a new tab, and say so to
 * screen readers. Labels come from `legal.links`, the only part of the legal
 * messages sent to the browser.
 */
export function PolicyLinks({ policies, className }: { policies: Policy[]; className?: string }) {
  const t = useTranslations("legal.links");
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-1.5 text-sm", className)}>
      {policies.map((p) => (
        <li key={p}>
          <a
            href={HREF[p]}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-sm font-medium text-accent-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus"
          >
            {t(p)}
            <ExternalLink className="flip-rtl size-3.5" aria-hidden />
            <span className="sr-only">{t("newTab")}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
