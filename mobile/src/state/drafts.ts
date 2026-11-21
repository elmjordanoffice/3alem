import * as React from "react";
import { kv } from "../lib/storage";

export type SaveState = "saved" | "saving" | "offline" | "error";

/**
 * Drafts kept on the device, one per item stage, under the same keys the web
 * app uses (aalim:draft:<itemId>:<stage>). AsyncStorage is asynchronous, so a
 * scene's drafts are read into memory before the scene appears; after that
 * reads are synchronous and writes are debounced.
 */
const cache = new Map<string, unknown>();

export const draftKey = (itemId: string, stage: string) => `aalim:draft:${itemId}:${stage}`;

export async function preloadDrafts(itemId: string) {
  const keys = await kv.keys(`aalim:draft:${itemId}:`);
  const values = await kv.multiGet<unknown>(keys);
  for (const [k, v] of Object.entries(values)) cache.set(k, v);
}

export function readDraft<T>(key: string): T | null {
  return cache.has(key) ? (cache.get(key) as T) : null;
}

/** Forget every draft of an item once the scene is over. */
export async function clearDrafts(itemId: string) {
  for (const k of [...cache.keys()]) if (k.startsWith(`aalim:draft:${itemId}:`)) cache.delete(k);
  for (const k of await kv.keys(`aalim:draft:${itemId}:`)) await kv.remove(k);
}

export function useDraft<T>(key: string, initial: T, onSaveState?: (s: SaveState) => void) {
  const [value, setValue] = React.useState<T>(() => (cache.has(key) ? (cache.get(key) as T) : initial));
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    cache.set(key, value);
    onSaveState?.("saving");
    const id = setTimeout(() => {
      kv.set(key, value).then((ok) => onSaveState?.(ok ? "saved" : "error"));
    }, 400);
    return () => clearTimeout(id);
  }, [key, value, onSaveState]);
  return [value, setValue] as const;
}
