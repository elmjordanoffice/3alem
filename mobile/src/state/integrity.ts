import * as React from "react";
import { AppState } from "react-native";
import type { IntegrityEvent } from "../api/types";

/**
 * Context for reviewers, never a verdict (as on the web): paste-sized
 * insertions and leaving the app while a scene is open. Nothing is blocked.
 */
export function useIntegrity() {
  const events = React.useRef<IntegrityEvent[]>([]);
  const started = React.useRef(Date.now());
  React.useEffect(() => {
    started.current = Date.now();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "background") events.current.push({ type: "tab_hidden", at: Date.now() - started.current });
    });
    return () => sub.remove();
  }, []);
  return React.useMemo(
    () => ({
      paste: (chars: number) => {
        if (events.current.length < 500) events.current.push({ type: "paste", at: Date.now() - started.current, chars });
      },
      take: () => events.current.slice(0, 500),
      elapsedMs: () => Date.now() - started.current,
      reset: () => {
        events.current = [];
        started.current = Date.now();
      },
    }),
    [],
  );
}

export type Integrity = ReturnType<typeof useIntegrity>;
export const IntegrityContext = React.createContext<Integrity | null>(null);
export function usePasteReporter() {
  return React.useContext(IntegrityContext)?.paste;
}
