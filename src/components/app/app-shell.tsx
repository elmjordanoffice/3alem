"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Building2,
  Check,
  ClipboardList,
  Sprout,
  Dumbbell,
  BookOpen,
  LineChart,
  MessagesSquare,
  UsersRound,
  Scale,
  Plug,
  ScrollText,
  Library,
  ListChecks,
  Search,
  ChevronsUpDown,
  Home,
  Layers,
  LogOut,
  Menu,
  Palette,
  Plus,
  Settings,
  Shield,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { switchOrganization } from "@/app/actions/organizations";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
import { INK_GHOST } from "@/components/ui/ink";
import { LanguageToggle, ThemeMenu } from "./preference-controls";
import { CommandMenu, openCommandMenu, type CommandPage } from "./command-menu";

export interface ShellNavItem {
  href: string;
  labelKey: string;
  icon: "home" | "assessments" | "framework" | "members" | "orgSettings" | "settings" | "admin" | "design" | "grow" | "practice" | "tracks" | "progress" | "coach" | "teams" | "fairness" | "integrations" | "audit" | "library" | "items";
}

export interface ShellProps {
  user: { name: string; email: string };
  organizations: { id: string; name: string }[];
  activeOrganizationId: string | null;
  nav: { sectionKey: string; items: ShellNavItem[] }[];
  commandPages: CommandPage[];
  canCreateAssessment: boolean;
  children: React.ReactNode;
}

const ICONS: Record<ShellNavItem["icon"], LucideIcon> = {
  home: Home,
  assessments: ClipboardList,
  framework: Layers,
  members: Users,
  orgSettings: Building2,
  settings: Settings,
  admin: Shield,
  design: Palette,
  grow: Sprout,
  practice: Dumbbell,
  tracks: BookOpen,
  progress: LineChart,
  coach: MessagesSquare,
  teams: UsersRound,
  fairness: Scale,
  integrations: Plug,
  audit: ScrollText,
  library: Library,
  items: ListChecks,
};

export function AppShell({ user, organizations, activeOrganizationId, nav, commandPages, canCreateAssessment, children }: ShellProps) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  // The menu is open for the route it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = React.useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (next: boolean) => setOpenAt(next ? pathname : null);

  const sidebar = (
    <SidebarContent
      user={user}
      organizations={organizations}
      activeOrganizationId={activeOrganizationId}
      nav={nav}
    />
  );

  return (
    <div className="flex min-h-dvh bg-sidebar">
      <CommandMenu pages={commandPages} canCreateAssessment={canCreateAssessment} />
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        {sidebar}
      </aside>

      {/* The work sits on a sheet of paper laid on the ink desk. */}
      <div className="flex min-w-0 flex-1 flex-col bg-background lg:my-2 lg:me-2 lg:min-h-[calc(100dvh-1rem)] lg:overflow-clip lg:rounded-[16px] lg:shadow-[0_0_0_1px_rgb(245_244_255/0.06),0_8px_32px_-8px_rgb(0_0_0/0.4)]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-sidebar px-3 text-sidebar-foreground lg:hidden">
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger
              className="inline-flex size-9 items-center justify-center rounded-control text-sidebar-secondary hover:bg-ink-foreground/10 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-focus"
              aria-label={t("openMenu")}
            >
              <Menu className="size-5" aria-hidden />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content className="fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground data-[state=open]:animate-fade-in">
                <DialogPrimitive.Title className="sr-only">{t("menu")}</DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="absolute end-3 top-3.5 inline-flex size-8 items-center justify-center rounded-control text-sidebar-secondary hover:bg-ink-foreground/10 hover:text-sidebar-foreground"
                  aria-label={t("closeMenu")}
                >
                  <X className="size-4" aria-hidden />
                </DialogPrimitive.Close>
                {sidebar}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
          <Logo showArabic={false} reverse />
          <div className="ms-auto flex items-center">
            <button type="button" onClick={openCommandMenu} className="inline-flex size-9 items-center justify-center rounded-control text-sidebar-secondary hover:bg-ink-foreground/10 hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-focus" aria-label={t("search")}>
              <Search className="size-5" aria-hidden />
            </button>
            <ThemeMenu className={INK_GHOST} />
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, organizations, activeOrganizationId, nav }: Pick<ShellProps, "user" | "organizations" | "activeOrganizationId" | "nav">) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const router = useRouter();
  const active = organizations.find((o) => o.id === activeOrganizationId);
  // The most specific nav entry that contains the current path is the current page.
  const currentHref = nav
    .flatMap((s) => s.items.map((i) => i.href))
    .filter((h) => pathname === h || (h !== "/app" && pathname.startsWith(`${h}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Link href="/app" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Logo reverse />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-[10px] bg-sidebar-raised px-2.5 py-2 text-start text-sm shadow-[inset_0_0_0_1px_var(--sidebar-border)] transition-colors hover:bg-sidebar-active focus-visible:outline-2 focus-visible:outline-focus">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-[7px] bg-ink-foreground font-display text-[13px] font-semibold text-ink" aria-hidden>
              {active ? active.name.trim().charAt(0).toUpperCase() : <Building2 className="size-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] leading-tight text-sidebar-tertiary">{t("workspace")}</span>
              <span className="block truncate font-medium text-sidebar-foreground">{active?.name ?? t("personal")}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-sidebar-tertiary" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
            <DropdownMenuLabel>{t("organizations")}</DropdownMenuLabel>
            {organizations.length === 0 ? (
              <p className="px-2.5 py-2 text-sm text-secondary">{t("noOrganizations")}</p>
            ) : (
              organizations.map((o) => (
                <DropdownMenuItem
                  key={o.id}
                  onSelect={async () => {
                    await switchOrganization(o.id);
                    router.refresh();
                  }}
                >
                  <span className="flex-1 truncate">{o.name}</span>
                  {o.id === activeOrganizationId ? <Check className="!text-accent-text" aria-hidden /> : null}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
              <Plus aria-hidden />
              {t("createOrganization")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={openCommandMenu}
          className="flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-sm text-sidebar-secondary transition-colors hover:bg-ink-foreground/[0.07] hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Search className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="flex-1 text-start">{t("search")}</span>
          <kbd className="rounded-[5px] bg-ink-foreground/10 px-1.5 py-px font-sans text-[11px] text-sidebar-secondary" dir="ltr">⌘K</kbd>
        </button>
      </div>

      <nav aria-label={t("primaryNav")} className="flex-1 overflow-y-auto px-3 py-1">
        {nav.map((section) => (
          <div key={section.sectionKey} className="mb-6">
            {section.sectionKey !== "main" ? (
              <p className="eyebrow px-2.5 pb-2 text-sidebar-tertiary">{t(`sections.${section.sectionKey}`)}</p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon];
                const current = item.href === currentHref;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative flex h-9 items-center gap-3 rounded-control px-2.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-focus",
                        current
                          ? "bg-sidebar-active font-medium text-sidebar-foreground shadow-[inset_0_1px_0_rgb(245_244_255/0.06)]"
                          : "text-sidebar-secondary hover:bg-ink-foreground/[0.07] hover:text-sidebar-foreground",
                      )}
                    >
                      {current ? <span className="absolute inset-y-2 -start-3 w-[3px] rounded-e-full bg-sidebar-accent" aria-hidden /> : null}
                      <Icon className={cn("size-4", current ? "text-sidebar-accent" : "text-sidebar-tertiary")} strokeWidth={1.75} aria-hidden />
                      {t(`nav.${item.labelKey}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control p-1.5 text-start transition-colors hover:bg-ink-foreground/[0.07] focus-visible:outline-2 focus-visible:outline-focus">
            <Avatar name={user.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-sidebar-foreground">{user.name}</span>
              <span className="block truncate text-xs text-sidebar-tertiary">{user.email}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuItem onSelect={() => router.push("/app/settings")}>
              <Settings aria-hidden />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await authClient.signOut();
                router.replace("/sign-in");
                router.refresh();
              }}
            >
              <LogOut className="flip-rtl" aria-hidden />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-2">
        <LanguageToggle className={INK_GHOST} />
        <ThemeMenu className={INK_GHOST} />
      </div>
    </div>
  );
}
