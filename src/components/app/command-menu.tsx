"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Command } from "cmdk";
import { ClipboardList, CornerDownLeft, FileText, Languages, Moon, Plus, Search, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import { commandSearch, type SearchHit } from "@/app/actions/search";
import { setLocale } from "@/app/actions/preferences";
import { useLocaleSettings } from "@/components/providers";
import { cn } from "@/lib/utils";

export interface CommandPage {
  href: string;
  label: string;
  /** Section it belongs to, shown as context and used for matching. */
  section?: string;
}

const OPEN_EVENT = "aalim:command-menu";
/** Open the command menu from anywhere (e.g. a search button). */
export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const HIT_ICON: Record<SearchHit["group"], LucideIcon> = { assessments: ClipboardList, candidates: FileText, teams: UsersRound, members: UserRound };
const norm = (s: string) => s.toLocaleLowerCase().normalize("NFKD").replace(/[ً-ْ̀-ͯ]/g, "");

/**
 * ⌘K / Ctrl+K: jump to any page, run common actions, and find candidates,
 * roles, teams and people. Search results respect the viewer's permissions.
 */
export function CommandMenu({ pages, canCreateAssessment }: { pages: CommandPage[]; canCreateAssessment: boolean }) {
  const t = useTranslations("shell.command");
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { locale } = useLocaleSettings();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [searching, setSearching] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  // Debounced server search; stale responses are ignored.
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let live = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await commandSearch(q).catch(() => []);
      if (live) {
        setHits(res);
        setSearching(false);
      }
    }, 180);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const q = norm(query.trim());
  const visibleHits = query.trim().length >= 2 ? hits : [];
  const matchedPages = pages.filter((p) => !q || norm(`${p.label} ${p.section ?? ""}`).includes(q));
  const actions = [
    ...(canCreateAssessment ? [{ id: "new", label: t("newAssessment"), icon: Plus, run: () => router.push("/app/assessments/new") }] : []),
    { id: "theme", label: resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme"), icon: Moon, run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
    { id: "lang", label: locale === "ar" ? "Switch to English" : "التبديل إلى العربية", icon: Languages, run: async () => { await setLocale(locale === "ar" ? "en" : "ar"); router.refresh(); } },
  ].filter((a) => !q || norm(a.label).includes(q));
  const groups = (["candidates", "assessments", "teams", "members"] as const).map((g) => ({ g, items: visibleHits.filter((h) => h.group === g) })).filter((x) => x.items.length);

  const go = (fn: () => void) => {
    setOpen(false);
    setQuery("");
    fn();
  };

  const item = "flex h-10 cursor-pointer items-center gap-3 rounded-control px-3 text-sm text-text data-[selected=true]:bg-surface-subtle";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
      label={t("label")}
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in"
      contentClassName="fixed start-1/2 top-[12vh] z-50 w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-card border border-border bg-surface shadow-popover ltr:-translate-x-1/2 rtl:translate-x-1/2 data-[state=open]:animate-fade-in"
    >
      <div className="flex items-center gap-3 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-tertiary" aria-hidden />
        <Command.Input value={query} onValueChange={setQuery} placeholder={t("placeholder")} className="h-14 flex-1 bg-transparent text-base text-text outline-none placeholder:text-tertiary" />
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[11px] text-tertiary sm:block">Esc</kbd>
      </div>
      <Command.List className="max-h-[min(60vh,28rem)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-tertiary">
        {!matchedPages.length && !actions.length && !groups.length ? (
          <div className="px-3 py-10 text-center text-sm text-secondary">{searching ? t("searching") : t("empty", { q: query.trim() })}</div>
        ) : null}
        {groups.map(({ g, items }) => (
          <Command.Group key={g} heading={t(`groups.${g}`)}>
            {items.map((h) => {
              const Icon = HIT_ICON[h.group];
              return (
                <Command.Item key={`${g}-${h.id}`} value={`${g}-${h.id}`} onSelect={() => go(() => router.push(h.href))} className={item}>
                  <Icon className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} aria-hidden />
                  <span className="min-w-0 flex-1 truncate" dir="auto">{h.title}</span>
                  {h.subtitle ? <span className="max-w-[45%] truncate text-xs text-tertiary" dir="auto">{h.subtitle}</span> : null}
                </Command.Item>
              );
            })}
          </Command.Group>
        ))}
        {matchedPages.length ? (
          <Command.Group heading={t("groups.pages")}>
            {matchedPages.map((p) => (
              <Command.Item key={p.href} value={p.href} onSelect={() => go(() => router.push(p.href))} className={item}>
                <CornerDownLeft className="size-4 shrink-0 text-tertiary flip-rtl" strokeWidth={1.75} aria-hidden />
                <span className="flex-1 truncate">{p.label}</span>
                {p.section ? <span className="text-xs text-tertiary">{p.section}</span> : null}
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
        {actions.length ? (
          <Command.Group heading={t("groups.actions")}>
            {actions.map((a) => (
              <Command.Item key={a.id} value={`action-${a.id}`} onSelect={() => go(() => void a.run())} className={item}>
                <a.icon className="size-4 shrink-0 text-tertiary" strokeWidth={1.75} aria-hidden />
                <span className="flex-1 truncate">{a.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        ) : null}
      </Command.List>
      <div className={cn("flex items-center gap-4 border-t border-border px-4 py-2.5 text-xs text-tertiary")}>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-border px-1">↑</kbd><kbd className="rounded border border-border px-1">↓</kbd>{t("navigate")}</span>
        <span className="flex items-center gap-1.5"><kbd className="rounded border border-border px-1">↵</kbd>{t("open")}</span>
      </div>
    </Command.Dialog>
  );
}
