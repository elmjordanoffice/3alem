"use client";
import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { setLocale } from "@/app/actions/preferences";
import { useLocaleSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/menu";

/** Switches between English and Arabic. Labels each language in its own script. */
export function LanguageToggle({ variant = "ghost" }: { variant?: "ghost" | "secondary" }) {
  const t = useTranslations("preferences");
  const { locale } = useLocaleSettings();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <Button
      variant={variant}
      size="sm"
      loading={pending}
      onClick={() =>
        start(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      aria-label={t("switchLanguage")}
    >
      {!pending ? <Languages aria-hidden /> : null}
      <span lang={next}>{next === "ar" ? "العربية" : "English"}</span>
    </Button>
  );
}

export function ThemeMenu() {
  const t = useTranslations("preferences");
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const Icon = !mounted ? Monitor : theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t("theme")}>
          <Icon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mounted ? (theme ?? "system") : "system"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="system">{t("themeSystem")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">{t("themeLight")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">{t("themeDark")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
