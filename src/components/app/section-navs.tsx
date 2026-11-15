"use client";
import { Building2, Shield, Sprout } from "lucide-react";
import { SectionNav, type SectionTab } from "./section-nav";

// Icons can't cross the server/client boundary as props, so each section has a small wrapper.
export function SectionNavGrow(props: { title: string; tabs: SectionTab[] }) {
  return <SectionNav {...props} icon={Sprout} hideOn={["/app/grow/onboarding"]} />;
}
export function SectionNavOrg(props: { title: string; tabs: SectionTab[] }) {
  return <SectionNav {...props} icon={Building2} />;
}
export function SectionNavAdmin(props: { title: string; tabs: SectionTab[] }) {
  return <SectionNav {...props} icon={Shield} />;
}
