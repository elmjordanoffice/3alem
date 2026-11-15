import { getTranslations } from "next-intl/server";
import { RangeScale } from "@/components/report/range-scale";

/**
 * The landing page's one moment of motion: a scene from an assessment, the
 * candidate's answer with the evidence highlighted, and the skill estimate
 * narrowing as the scenes add up.
 */
export async function HeroDemo() {
  const t = await getTranslations("landing.demo");
  return (
    <figure aria-label={t("label")} className="relative overflow-hidden rounded-[20px] bg-ink p-5 text-ink-foreground shadow-raised sm:p-7">
      <div className="flex items-center justify-between gap-3 text-xs text-ink-secondary">
        <span>{t("chapter")}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-saffron" aria-hidden />
          {t("live")}
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-ink-raised p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-ink-foreground/10 text-sm font-medium" aria-hidden>
            {t("fromInitials")}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{t("from")}</span>
            <span className="block text-xs text-ink-secondary">{t("fromRole")}</span>
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed">{t("message")}</p>
      </div>

      <div className="mt-4 rounded-2xl bg-surface p-4 text-text sm:p-5">
        <p className="text-xs font-medium text-tertiary">{t("answerLabel")}</p>
        <p className="mt-2 text-[15px] leading-relaxed">
          {t("answerStart")} <mark className="evidence-mark">{t("answerEvidence")}</mark> {t("answerEnd")}
        </p>
      </div>

      <figcaption className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">{t("skill")}</span>
          <span className="text-sm text-ink-secondary">
            {t("level")} <bdi dir="ltr" className="tabular">{t("range")}</bdi>
          </span>
        </div>
        <RangeScale low={3.6} high={4.2} estimate={3.9} expected={4} tone="ink" size="lg" animate className="mt-3" labels={[t("scaleLow"), t("scaleHigh")]} />
        <p className="mt-4 text-xs leading-relaxed text-ink-secondary">{t("note")}</p>
      </figcaption>
    </figure>
  );
}
