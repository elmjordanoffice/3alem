import type { Metadata } from "next";
import { candidateView } from "@/lib/hire/candidate-state";
import { CandidateApp } from "@/components/candidate/candidate-app";

export const metadata: Metadata = { title: "Assessment", referrer: "no-referrer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await candidateView(token);
  return <CandidateApp token={token} initial={view} />;
}
