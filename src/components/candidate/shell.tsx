"use client";
import * as React from "react";
import { Logo } from "@/components/brand/logo";
import type { Branding } from "@/lib/hire/candidate-state";
import { brandStyle } from "./brand";
import { ThemeMenu } from "@/components/app/preference-controls";

/** The calm frame around every candidate screen: the employer, a theme toggle, nothing else. */
export function CandidateShell({ branding, center, end, children }: { branding?: Branding; center?: React.ReactNode; end?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="app-canvas flex min-h-dvh flex-col" style={brandStyle(branding?.brandColor ?? null)}>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            {branding?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logoUrl} alt="" className="h-6 w-auto" />
            ) : null}
            {branding ? (
              <span className="flex min-w-0 items-center gap-2.5">
                {!branding.logoUrl ? <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-ink text-[13px] font-semibold text-ink-foreground" aria-hidden>{branding.orgName.trim().charAt(0).toUpperCase()}</span> : null}
                <span className="truncate text-sm font-semibold text-text">{branding.orgName}</span>
              </span>
            ) : (
              <Logo />
            )}
          </div>
          {center ? <div className="order-3 w-full sm:order-none sm:flex-1 sm:px-6">{center}</div> : <div className="flex-1" />}
          <div className="flex items-center gap-2">
            {end}
            <ThemeMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-tertiary">
        <span className="inline-flex items-center gap-1.5">
          <Logo showArabic={false} className="scale-75 opacity-70" />
        </span>
      </footer>
    </div>
  );
}
