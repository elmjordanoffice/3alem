import { getTranslations } from "next-intl/server";
import { SectionNavGrow } from "@/components/app/section-navs";

export default async function GrowLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <>
      <SectionNavGrow
        title={t("nav.grow")}
        tabs={[
          { href: "/app/grow", label: t("nav.overview"), exact: true },
          { href: "/app/grow/practice", label: t("nav.practice") },
          { href: "/app/grow/tracks", label: t("nav.tracks") },
          { href: "/app/grow/progress", label: t("nav.progress") },
          { href: "/app/grow/coach", label: t("nav.coach") },
        ]}
      />
      {children}
    </>
  );
}
