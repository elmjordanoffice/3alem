import * as React from "react";

/**
 * The deck's current page, outside React state: changing page re-renders only
 * what reads it (the page rail, and the two cards whose screen-reader
 * visibility flips), never the whole scene and every card in it.
 */
export interface IndexStore {
  get: () => number;
  set: (i: number) => void;
  subscribe: (fn: () => void) => () => void;
}

export function createIndexStore(initial = 0): IndexStore {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set: (i) => {
      if (i === value) return;
      value = i;
      subs.forEach((fn) => fn());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
}

/** The current page. */
export function usePageIndex(store: IndexStore) {
  return React.useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Whether page `i` is the current one; re-renders only when that flips. */
export function useIsCurrentPage(store: IndexStore, i: number) {
  const get = React.useCallback(() => store.get() === i, [store, i]);
  return React.useSyncExternalStore(store.subscribe, get, get);
}
