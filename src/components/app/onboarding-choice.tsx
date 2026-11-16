"use client";
import * as React from "react";
import Link from "next/link";
import { Building2, Sprout, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { createOrganization } from "@/app/actions/organizations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function OnboardingChoice() {
  const t = useTranslations("onboarding");
  const [choice, setChoice] = React.useState<"org" | "individual" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const options = [
    { key: "org" as const, icon: Building2 },
    { key: "individual" as const, icon: Sprout },
  ];

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div role="radiogroup" aria-label={t("chooseLabel")} className="grid gap-3 sm:grid-cols-2">
        {options.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={choice === key}
            onClick={() => setChoice(key)}
            className={cn(
              "flex flex-col gap-3 rounded-card border bg-surface p-5 text-start transition-colors duration-150 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              choice === key ? "border-accent ring-1 ring-accent" : "border-border",
            )}
          >
            <Icon className="size-5 text-accent-text" strokeWidth={1.5} aria-hidden />
            <span className="text-base font-semibold text-text">{t(`${key}.title`)}</span>
            <span className="text-sm text-secondary">{t(`${key}.body`)}</span>
          </button>
        ))}
      </div>

      {choice === "org" ? (
        <form
          className="flex animate-slide-up flex-col gap-4 rounded-card bg-surface shadow-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const name = String(new FormData(e.currentTarget).get("name") ?? "");
            setPending(true);
            setError(null);
            const result = await createOrganization({ name });
            // On success the action redirects, so we only get here on failure.
            setPending(false);
            if (result && !result.ok) setError(t("errors.nameLength"));
          }}
        >
          <Field label={t("org.nameLabel")} hint={t("org.nameHint")} error={error ?? undefined}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} name="name" autoFocus aria-describedby={describedBy} aria-invalid={invalid || undefined} />
            )}
          </Field>
          <Button type="submit" loading={pending} className="self-start">
            {t("org.submit")}
          </Button>
        </form>
      ) : null}

      {choice === "individual" ? (
        <div className="flex animate-slide-up flex-col gap-4 rounded-card bg-surface shadow-card p-5">
          <p className="text-sm text-secondary">{t("individual.next")}</p>
          <Button asChild className="self-start">
            <Link href="/app">
              {t("individual.submit")}
              <ArrowRight className="flip-rtl" aria-hidden />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
