"use client";
import * as React from "react";
import type { SaveState } from "@/components/assessment/autosave-indicator";

/** Read/write localStorage safely (private mode, quota, disabled storage). */
export const store = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/**
 * Draft state kept on the device: nothing is lost if the tab closes, the
 * connection drops or the browser crashes.
 */
export function useDraft<T>(key: string, initial: T, onSaveState?: (s: SaveState) => void) {
  const [value, setValue] = React.useState<T>(() => (typeof window === "undefined" ? initial : (store.get<T>(key) ?? initial)));
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onSaveState?.("saving");
    const id = window.setTimeout(() => {
      onSaveState?.(store.set(key, value) ? "saved" : "error");
    }, 400);
    return () => window.clearTimeout(id);
  }, [key, value, onSaveState]);
  return [value, setValue] as const;
}

export interface IntegrityEvent {
  type: "paste" | "tab_hidden" | "focus_lost";
  at: number;
  chars?: number;
}

/** Context for reviewers: pastes and tab switches. Never blocks anything. */
export function useIntegrityCapture(containerRef: React.RefObject<HTMLElement | null>) {
  const events = React.useRef<IntegrityEvent[]>([]);
  const started = React.useRef(0);
  React.useEffect(() => {
    started.current = Date.now();
    const el = containerRef.current;
    const onPaste = (e: ClipboardEvent) => {
      const chars = e.clipboardData?.getData("text/plain").length ?? 0;
      if (chars > 0) events.current.push({ type: "paste", at: Date.now() - started.current, chars });
    };
    const onVis = () => {
      if (document.visibilityState === "hidden") events.current.push({ type: "tab_hidden", at: Date.now() - started.current });
    };
    el?.addEventListener("paste", onPaste, true);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      el?.removeEventListener("paste", onPaste, true);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [containerRef]);
  return {
    take: () => events.current.slice(0, 500),
    elapsedMs: () => Date.now() - started.current,
    reset: () => {
      events.current = [];
      started.current = Date.now();
    },
  };
}

export function newClientId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return React.useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
