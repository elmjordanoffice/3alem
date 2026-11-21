import * as React from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { ApiError, type Api } from "../api/client";
import type { CandidateView, SubmitPayload } from "../api/types";
import { kv } from "../lib/storage";
import { haptic } from "../lib/haptics";
import { clearDrafts, preloadDrafts } from "./drafts";

const OK_ANYWAY = new Set(["wrong_stage", "not_current"]);

/**
 * The candidate flow, driven by the server's CandidateView. Owns the offline
 * outbox, as the web does: an answer is written to the device before it is
 * sent, retried with backoff while offline (and on reconnect or return to the
 * app), and only removed once the server has it.
 */
export function useAssessment(api: Api | null, token: string | null) {
  const [view, setViewState] = React.useState<CandidateView | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [online, setOnline] = React.useState(true);
  const [pending, setPending] = React.useState<SubmitPayload | null>(null);
  const [needsRetry, setNeedsRetry] = React.useState(false);
  const currentItem = React.useRef<string | null>(null);
  const inflight = React.useRef(false);
  const attempt = React.useRef(0);
  const outboxKey = token ? `aalim:outbox:${token}` : null;

  /** Drafts are read before a scene appears, so the deck never flashes empty. */
  const apply = React.useCallback(async (v: CandidateView) => {
    const nextItem = v.view === "item" ? v.item.id : null;
    if (nextItem) await preloadDrafts(nextItem);
    const prev = currentItem.current;
    if (prev && nextItem && prev !== nextItem) void clearDrafts(prev);
    if (nextItem) currentItem.current = nextItem;
    setViewState(v);
    setError(null);
  }, []);

  const load = React.useCallback(async () => {
    if (!api) return;
    try {
      await apply(await api.view());
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError("network"));
    }
  }, [api, apply]);

  React.useEffect(() => {
    setViewState(null);
    void load();
    if (outboxKey)
      kv.get<SubmitPayload>(outboxKey).then((p) => {
        if (p) {
          setPending(p);
          setNeedsRetry(true);
        }
      });
  }, [load, outboxKey]);

  // Connectivity: back online, try again now.
  React.useEffect(
    () =>
      NetInfo.addEventListener((s) => {
        const on = s.isConnected !== false && s.isInternetReachable !== false;
        if (on) attempt.current = 0;
        setOnline(on);
      }),
    [],
  );

  // Back in the app: try again now.
  React.useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") attempt.current = 0;
    });
    return () => sub.remove();
  }, []);

  // While the first scene is being prepared, check back quietly.
  React.useEffect(() => {
    if (view?.view !== "preparing" || !api) return;
    const id = setInterval(() => {
      api.refresh().then(apply).catch(() => undefined);
    }, 1500);
    return () => clearInterval(id);
  }, [view?.view, api, apply]);

  /** Run an action that returns the next view. */
  const act = React.useCallback(
    async (fn: (a: Api) => Promise<CandidateView>) => {
      if (!api) return;
      await apply(await fn(api));
    },
    [api, apply],
  );

  const send = React.useCallback(
    async (p: SubmitPayload): Promise<{ ok: boolean; offline?: boolean }> => {
      if (!api || !outboxKey) return { ok: false };
      if (inflight.current) return { ok: false, offline: true };
      inflight.current = true;
      try {
        const res = await api.submit(p);
        if (!res.ok && !OK_ANYWAY.has(res.error ?? "")) return { ok: false };
        await kv.remove(outboxKey);
        setPending(null);
        setNeedsRetry(false);
        attempt.current = 0;
        haptic.success();
        await apply(res.view);
        return { ok: true };
      } catch (e) {
        const offline = e instanceof ApiError ? e.offline || e.status === 429 || e.status >= 500 : true;
        if (offline) setNeedsRetry(true);
        else {
          // Refused for good (validation, a finished session): don't retry forever.
          await kv.remove(outboxKey);
          setPending(null);
        }
        return { ok: false, offline };
      } finally {
        inflight.current = false;
      }
    },
    [api, outboxKey, apply],
  );

  /** Submit through the outbox: saved on the device first, so nothing is lost. */
  const submit = React.useCallback(
    async (p: SubmitPayload) => {
      if (outboxKey) await kv.set(outboxKey, p);
      setPending(p);
      attempt.current = 0;
      return send(p);
    },
    [outboxKey, send],
  );

  // Retry with backoff while something is waiting to be sent.
  React.useEffect(() => {
    if (!pending || !view || !needsRetry) return;
    if (view.view !== "item" || view.item.id !== pending.itemId || view.item.stage !== pending.stage) {
      // The server has moved on (it already has this answer): drop it.
      if (outboxKey) void kv.remove(outboxKey);
      setPending(null);
      setNeedsRetry(false);
      return;
    }
    if (!online) return;
    const delay = attempt.current === 0 ? 400 : Math.min(30_000, 1500 * 2 ** attempt.current);
    const id = setTimeout(() => {
      setNeedsRetry(false);
      attempt.current += 1;
      void send(pending);
    }, delay);
    return () => clearTimeout(id);
  }, [pending, online, view, needsRetry, send, outboxKey]);

  return { view, error, online, pending, load, act, submit };
}
