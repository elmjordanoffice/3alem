"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

/** Re-fetch the page every few seconds (e.g. while a report is being written). */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  React.useEffect(() => {
    const id = window.setInterval(() => router.refresh(), seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);
  return null;
}
