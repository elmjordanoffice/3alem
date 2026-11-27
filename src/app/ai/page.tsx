import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
import { legalMetadata } from "@/lib/legal";

export function generateMetadata(): Promise<Metadata> {
  return legalMetadata("ai");
}

export default function Page() {
  return <LegalPage doc="ai" />;
}
