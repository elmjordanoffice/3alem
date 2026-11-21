import * as React from "react";
import { I18nManager, Platform } from "react-native";
import { getLocales } from "expo-localization";
// The candidate copy is shared with the web app: one source of truth.
// (metro.config.js watches ../messages so Metro can bundle these.)
import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";
import { kv } from "../lib/storage";
import { formatMessage, type Params } from "./format";
import { mobileAr, mobileEn } from "./mobile";
import { sharedFallbackAr, sharedFallbackEn } from "./fallback";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

type Tree = { [key: string]: string | Tree };

const MESSAGES: Record<Locale, Tree> = {
  en: { ...(enMessages as unknown as Tree), mobile: mobileEn as unknown as Tree },
  ar: { ...(arMessages as unknown as Tree), mobile: mobileAr as unknown as Tree },
};

/** Shared keys newer than this branch's messages/*.json (see fallback.ts). */
const FALLBACK: Record<Locale, Tree> = { en: sharedFallbackEn as unknown as Tree, ar: sharedFallbackAr as unknown as Tree };

const LOCALE_KEY = "aalim:locale";

function lookup(tree: Tree, path: string): string | undefined {
  let node: string | Tree | undefined = tree;
  for (const part of path.split(".")) {
    if (!node || typeof node === "string") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

/** Latin digits in both languages, as the web app shows by default. */
export function numberFormatter(locale: Locale) {
  const tag = `${locale}-u-nu-latn`;
  let nf: Intl.NumberFormat | null = null;
  try {
    nf = new Intl.NumberFormat(tag);
  } catch {
    nf = null;
  }
  return (n: number, o?: Intl.NumberFormatOptions) => {
    try {
      return o ? new Intl.NumberFormat(tag, o).format(n) : (nf?.format(n) ?? String(n));
    } catch {
      return String(n);
    }
  };
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

interface LocaleValue {
  locale: Locale;
  dir: Dir;
  rtl: boolean;
  /** True once the user (or the invitation) has chosen a language. */
  chosen: boolean;
  setLocale: (l: Locale, opts?: { persist?: boolean }) => void;
  t: (key: string, params?: Params) => string;
  n: (value: number, o?: Intl.NumberFormatOptions) => string;
}

const LocaleContext = React.createContext<LocaleValue | null>(null);

function deviceLocale(): Locale {
  try {
    return getLocales()[0]?.languageCode === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

/**
 * Layout direction. Every screen sets `direction` on its root so Arabic is
 * mirrored immediately; I18nManager is updated too, so system surfaces (the
 * keyboard, scroll indicators, native transitions) agree from the next launch
 * without a jarring reload mid-assessment.
 */
function syncNativeDirection(rtl: boolean) {
  if (Platform.OS === "web") {
    if (typeof document !== "undefined") {
      document.documentElement.dir = rtl ? "rtl" : "ltr";
      document.documentElement.lang = rtl ? "ar" : "en";
    }
    return;
  }
  try {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== rtl) I18nManager.forceRTL(rtl);
  } catch {
    /* ignore */
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<{ locale: Locale; chosen: boolean }>(() => ({ locale: deviceLocale(), chosen: false }));
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    kv.get<Locale>(LOCALE_KEY).then((saved) => {
      if (saved === "en" || saved === "ar") setState({ locale: saved, chosen: true });
      setReady(true);
    });
  }, []);

  React.useEffect(() => syncNativeDirection(state.locale === "ar"), [state.locale]);

  const value = React.useMemo<LocaleValue>(() => {
    const { locale } = state;
    const tree = MESSAGES[locale];
    const n = numberFormatter(locale);
    const fmtNumber = (x: number) => n(x);
    return {
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      rtl: locale === "ar",
      chosen: state.chosen,
      setLocale: (l, opts) => {
        setState({ locale: l, chosen: opts?.persist !== false ? true : state.chosen });
        if (opts?.persist !== false) void kv.set(LOCALE_KEY, l);
      },
      t: (key, params) => {
        const msg = lookup(tree, key) ?? lookup(FALLBACK[locale], key) ?? lookup(MESSAGES.en, key) ?? lookup(FALLBACK.en, key);
        if (msg === undefined) return key;
        return params ? formatMessage(msg, params, locale, fmtNumber) : msg.includes("{") ? formatMessage(msg, {}, locale, fmtNumber) : msg;
      },
      n,
    };
  }, [state]);

  if (!ready) return null;
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const v = React.useContext(LocaleContext);
  if (!v) throw new Error("useLocale outside LocaleProvider");
  return v;
}

/** A translator scoped to a namespace, like next-intl's useTranslations. */
export function useT(namespace?: string) {
  const { t } = useLocale();
  return React.useCallback((key: string, params?: Params) => t(namespace ? `${namespace}.${key}` : key, params), [t, namespace]);
}
