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
import { LanguageToggle, ThemeMenu } from "./preference-controls";

export interface ShellNavItem {
  href: string;
  labelKey: string;
  icon: "home" | "assessments" | "framework" | "members" | "orgSettings" | "settings" | "admin" | "design";
}

export interface ShellProps {
  user: { name: string; email: string };
  organizations: { id: string; name: string }[];
  activeOrganizationId: string | null;
  nav: { sectionKey: string; items: ShellNavItem[] }[];
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
};

export function AppShell({ user, organizations, activeOrganizationId, nav, children }: ShellProps) {
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
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("skipToContent")}
      </a>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-border bg-surface-subtle lg:flex">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm lg:hidden">
          <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger
              className="inline-flex size-9 items-center justify-center rounded-control text-secondary hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-focus"
              aria-label={t("openMenu")}
            >
              <Menu className="size-5" aria-hidden />
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay data-[state=open]:animate-fade-in" />
              <DialogPrimitive.Content className="fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col border-e border-border bg-surface-subtle data-[state=open]:animate-fade-in">
                <DialogPrimitive.Title className="sr-only">{t("menu")}</DialogPrimitive.Title>
                <DialogPrimitive.Close
                  className="absolute end-3 top-3.5 inline-flex size-8 items-center justify-center rounded-control text-tertiary hover:bg-surface hover:text-text"
                  aria-label={t("closeMenu")}
                >
                  <X className="size-4" aria-hidden />
                </DialogPrimitive.Close>
                {sidebar}
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
          <Logo showArabic={false} />
          <div className="ms-auto flex items-center">
            <ThemeMenu />
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, organizations, activeOrganizationId, nav }: Omit<ShellProps, "children">) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const router = useRouter();
  const active = organizations.find((o) => o.id === activeOrganizationId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <Link href="/app" className="rounded-control focus-visible:outline-2 focus-visible:outline-focus">
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-control border border-border bg-surface px-2.5 py-2 text-start text-sm hover:border-border-strong focus-visible:outline-2 focus-visible:outline-focus">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-surface-sunken text-secondary">
              <Building2 className="size-3.5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] leading-tight text-tertiary">{t("workspace")}</span>
              <span className="block truncate font-medium text-text">{active?.name ?? t("personal")}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-tertiary" aria-hidden />
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

      <nav aria-label={t("primaryNav")} className="flex-1 overflow-y-auto px-3 py-2">
        {nav.map((section) => (
          <div key={section.sectionKey} className="mb-5">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-tertiary">
              {t(`sections.${section.sectionKey}`)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICONS[item.icon];
                const current = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-control px-2.5 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-focus",
                        current
                          ? "bg-surface font-medium text-text shadow-[0_0_0_1px_var(--border)]"
                          : "text-secondary hover:bg-surface hover:text-text",
                      )}
                    >
                      <Icon className={cn("size-4", current ? "text-accent-text" : "text-tertiary")} strokeWidth={1.75} aria-hidden />
                      {t(`nav.${item.labelKey}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 flex-1 items-center gap-2.5 rounded-control p-1.5 text-start hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus">
            <Avatar name={user.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-text">{user.name}</span>
              <span className="block truncate text-xs text-tertiary">{user.email}</span>
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
      <div className="flex items-center justify-between border-t border-border px-3 py-2">
        <LanguageToggle />
        <ThemeMenu />
      </div>
    </div>
  );
}
