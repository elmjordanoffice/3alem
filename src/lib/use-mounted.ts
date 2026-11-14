"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True after hydration. Avoids a server/client mismatch for client-only values like the theme. */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
