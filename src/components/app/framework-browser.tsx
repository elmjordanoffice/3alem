"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Sparkles } from "lucide-react";
import { Collapsible } from "radix-ui";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNumbers } from "@/components/providers";

export interface FrameworkDomainView {
  key: string;
  order: number;
  name: string;
  description: string;
  highLevel: string;
  generated: boolean;
  custom: boolean;
  subSkills: { key: string; name: string; description: string; anchors: string[]; custom?: boolean }[];
}

const LEVEL_DOT = ["bg-level-1", "bg-level-2", "bg-level-3", "bg-level-4", "bg-level-5"];

export function FrameworkBrowser({ domains }: { domains: FrameworkDomainView[] }) {
  const t = useTranslations("framework");
  const tl = useTranslations("levels");
  const n = useNumbers();
  const [selected, setSelected] = React.useState(domains[0]?.key);
  const domain = domains.find((d) => d.key === selected) ?? domains[0]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
      <nav aria-label={t("domains")} className="lg:sticky lg:top-6 lg:self-start">
        <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {domains.map((d) => (
            <li key={d.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(d.key)}
                aria-current={d.key === domain.key ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-start text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-focus",
                  d.key === domain.key ? "bg-surface font-medium text-text shadow-[0_0_0_1px_var(--border)]" : "text-secondary hover:bg-surface-subtle hover:text-text",
                )}
              >
                <span className="w-4 shrink-0 text-xs text-tertiary tabular">{n.number(d.order)}</span>
                <span className="whitespace-nowrap lg:whitespace-normal">{d.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="domain-title" className="min-w-0" key={domain.key}>
        <div className="mb-6 flex flex-col gap-2 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="domain-title" className="text-lg font-semibold text-text">
              {domain.name}
            </h2>
            {domain.generated ? (
              <Badge tone="info">
                <Sparkles aria-hidden />
                {t("generatedBadge")}
              </Badge>
            ) : null}
            {domain.custom ? <Badge tone="accent">{t("customBadge")}</Badge> : null}
          </div>
          <p className="reading text-sm text-secondary">{domain.description}</p>
          <p className="reading text-sm text-text">
            <span className="font-medium">{t("highLevel")}</span> {domain.highLevel}
          </p>
          {domain.generated ? <p className="reading text-sm text-secondary">{t("generatedNote")}</p> : null}
        </div>

        <ul className="flex flex-col gap-2">
          {domain.subSkills.map((s, i) => (
            <li key={s.key}>
              <Collapsible.Root defaultOpen={i === 0} className="group rounded-card bg-surface shadow-card">
                <Collapsible.Trigger className="flex w-full items-start gap-3 p-4 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">{s.name}{s.custom ? <Badge tone="accent">{t("customBadge")}</Badge> : null}</span>
                    <span className="mt-0.5 block text-sm text-secondary">{s.description}</span>
                  </span>
                  <ChevronDown className="mt-0.5 size-4 shrink-0 text-tertiary transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden />
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <ol className="flex flex-col border-t border-border">
                    {s.anchors.map((a, li) => (
                      <li key={li} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-border px-4 py-3 last:border-b-0 sm:grid-cols-[9rem_1fr]">
                        <span className="flex items-center gap-2 self-start text-xs font-medium text-secondary">
                          <span className={cn("size-2.5 shrink-0 rounded-full", LEVEL_DOT[li])} aria-hidden />
                          <span className="tabular">{n.number(li + 1)}</span>
                          {tl(String(li + 1))}
                        </span>
                        <span className="text-sm leading-relaxed text-text">{a}</span>
                      </li>
                    ))}
                  </ol>
                </Collapsible.Content>
              </Collapsible.Root>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
