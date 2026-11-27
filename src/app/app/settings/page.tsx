import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { AccountSettings } from "@/components/app/account-settings";
import { DataRights } from "@/components/app/data-rights";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default async function SettingsPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("settings");
  const tl = await getTranslations("legal.links");
  const textSize = (await cookies()).get("AALIM_TEXT_SIZE")?.value === "large" ? "large" : "default";
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />
      <AccountSettings
        name={viewer.user.name}
        email={viewer.user.email}
        locale={viewer.user.locale}
        numerals={viewer.user.numerals}
        textSize={textSize}
      />
      <div className="mt-6">
        <DataRights email={viewer.user.email} />
      </div>
      <nav aria-label={tl("navLabel")} className="mt-8 border-t border-border pt-5">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {(["privacy", "terms", "ai", "security"] as const).map((k) => (
            <li key={k}>
              <Link href={`/${k}`} className="text-secondary underline-offset-4 hover:text-text hover:underline">
                {tl(k)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PageContainer>
  );
}
