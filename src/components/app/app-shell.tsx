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
import { Logo, LogoTile, Wordmark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/menu";
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
  const router = useRouter();
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
    <div className="app-canvas flex min-h-dvh">
      <CommandMenu pages={commandPages} canCreateAssessment={canCreateAssessment} />
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      {/* The rail: a floating rounded panel; the current page is a glowing violet pill. */}
      <aside className="sticky top-0 hidden h-dvh w-[17.5rem] shrink-0 p-4 pe-0 lg:block">
        <div className="h-full overflow-hidden rounded-[28px] bg-sidebar text-sidebar-foreground shadow-card">{sidebar}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 bg-background/80 px-3 text-text backdrop-blur-xl lg:hidden">
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger
              className="inline-flex size-9 items-center justify-center rounded-control text-secondary hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
              aria-label={t("openMenu")}
            >
              <Menu className="size-5" aria-hidden />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content className="fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground data-[state=open]:animate-fade-in">
                <DialogPrimitive.Title className="sr-only">{t("menu")}</DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="absolute end-3 top-4 inline-flex size-8 items-center justify-center rounded-control text-sidebar-secondary hover:bg-sidebar-raised hover:text-sidebar-foreground"
                  aria-label={t("closeMenu")}
                >
                  <X className="size-4" aria-hidden />
                </DialogPrimitive.Close>
                {sidebar}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
          <Logo showArabic={false} className="text-[14px]" />
          <div className="ms-auto flex items-center gap-1">
            <button type="button" onClick={openCommandMenu} className="inline-flex size-9 items-center justify-center rounded-control text-secondary hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-focus" aria-label={t("search")}>
              <Search className="size-5" aria-hidden />
            </button>
            <ThemeMenu />
          </div>
        </header>
        {/* Desktop top bar: the search pill and round controls. */}
        <header className="sticky top-0 z-30 hidden h-24 items-center gap-4 bg-gradient-to-b from-background via-background/90 to-transparent px-8 lg:flex">
          <button
            type="button"
            onClick={openCommandMenu}
            className="flex h-12 w-full max-w-[30rem] items-center gap-3 rounded-[16px] bg-surface px-5 text-sm text-tertiary shadow-card transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
          >
            <Search className="size-[18px]" strokeWidth={2} aria-hidden />
            <span className="flex-1 text-start">{t("search")}</span>
            <kbd className="rounded-[7px] bg-surface-sunken px-1.5 py-0.5 font-sans text-[11px] text-tertiary" dir="ltr">⌘K</kbd>
          </button>
          <div className="ms-auto flex items-center gap-3">
            <LanguageToggle className="h-11 rounded-full px-4" />
            <ThemeMenu className="size-11 rounded-full shadow-[inset_0_0_0_1px_var(--border-strong)]" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full p-1 pe-1 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus xl:pe-4">
                <Avatar name={user.name} className="size-11 text-sm" />
                <span className="hidden min-w-0 max-w-40 text-start xl:block">
                  <span className="block truncate text-sm font-semibold text-text">{user.name}</span>
                  <span className="block truncate text-xs text-tertiary">{user.email}</span>
                </span>
                <span className="sr-only xl:hidden">{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-text">{user.name}</p>
                  <p className="truncate text-xs text-tertiary">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/app/settings")}>
                  <Settings aria-hidden />
                  {t("nav.settings")}
                </DropdownMenuItem>
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
      <div className="flex h-20 items-center px-5">
        <Link href="/app" className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-focus">
          <LogoTile className="size-11" />
          <Wordmark className="h-[22px] text-sidebar-foreground" />
        </Link>
      </div>

      <div className="px-3 pb-2 pt-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-[18px] bg-sidebar-raised px-2.5 py-2.5 text-start text-sm transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-focus">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7b6cf0] to-[#5040ce] font-display text-[13px] font-bold text-white" aria-hidden>
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

      <div className="px-3 pb-3 lg:hidden">
        <button
          type="button"
          onClick={openCommandMenu}
          className="flex h-11 w-full items-center gap-2.5 rounded-[16px] bg-sidebar-raised px-4 text-sm text-sidebar-secondary transition-colors hover:bg-sidebar-raised hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Search className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="flex-1 text-start">{t("search")}</span>
          <kbd className="rounded-[5px] bg-sidebar px-1.5 py-px font-sans text-[11px] text-sidebar-tertiary shadow-[inset_0_0_0_1px_var(--sidebar-border)]" dir="ltr">⌘K</kbd>
        </button>
      </div>

      <nav aria-label={t("primaryNav")} className="flex-1 overflow-y-auto px-3 py-1">
        {nav.map((section) => (
          <div key={section.sectionKey} className="mb-6">
            {section.sectionKey !== "main" ? (
              <p className="eyebrow px-3 pb-2 text-sidebar-tertiary">{t(`sections.${section.sectionKey}`)}</p>
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
                        "relative flex h-12 items-center gap-3 rounded-full ps-1.5 pe-4 text-[14px] font-medium transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-focus",
                        current
                          ? "bg-sidebar-active font-semibold text-sidebar-accent shadow-[0_12px_26px_-10px_rgb(108_92_231/0.75)]"
                          : "text-sidebar-secondary hover:bg-sidebar-raised hover:text-sidebar-foreground",
                      )}
                    >
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", current ? "bg-white/15" : "")}>
                        <Icon className={cn("size-[18px]", current ? "text-sidebar-accent" : "text-sidebar-tertiary")} strokeWidth={current ? 2.25 : 1.85} aria-hidden />
                      </span>
                      <span className="truncate">{t(`nav.${item.labelKey}`)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 p-3 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl p-1.5 text-start transition-colors hover:bg-sidebar-raised focus-visible:outline-2 focus-visible:outline-focus">
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
      <div className="flex items-center justify-between px-3 pb-3 lg:hidden">
        <LanguageToggle />
        <ThemeMenu />
      </div>
      {/* Desktop: the account menu lives in the top bar; the rail also ends with sign out. */}
      <div className="hidden p-3 lg:block">
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/sign-in");
            router.refresh();
          }}
          className="flex h-12 w-full items-center gap-3 rounded-full ps-1.5 pe-4 text-[14px] font-medium text-sidebar-secondary transition-colors hover:bg-sidebar-raised hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span className="grid size-9 place-items-center rounded-full"><LogOut className="size-[18px] flip-rtl" aria-hidden /></span>
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
