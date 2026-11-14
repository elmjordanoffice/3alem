"use client";
import * as React from "react";
import { useMounted } from "@/lib/use-mounted";

/**
 * Spoken answers as a progressive enhancement: dictation through the
 * browser's Web Speech API (where available) and optional read-aloud of the
 * other person's replies. Typing always works; nothing here is required.
 */

interface RecognitionResult { isFinal: boolean; 0: { transcript: string } }
interface RecognitionEvent { resultIndex: number; results: ArrayLike<RecognitionResult> }
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const speechLang = (lang: string) => (lang.startsWith("ar") ? "ar-SA" : "en-GB");

export function useDictation(onFinal: (text: string) => void) {
  const mounted = useMounted();
  const supported = mounted && recognitionCtor() !== null;
  const [listening, setListening] = React.useState(false);
  const [interim, setInterim] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const rec = React.useRef<Recognition | null>(null);
  const finalRef = React.useRef(onFinal);
  React.useEffect(() => {
    finalRef.current = onFinal;
  }, [onFinal]);

  const stop = React.useCallback(() => {
    rec.current?.stop();
  }, []);

  const start = React.useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = speechLang(document.documentElement.lang || "en");
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]!;
        if (res.isFinal) finalRef.current(res[0].transcript.trim());
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => setError(e.error);
    r.onend = () => {
      setListening(false);
      setInterim("");
      rec.current = null;
    };
    rec.current = r;
    setError(null);
    setListening(true);
    r.start();
  }, []);

  React.useEffect(() => () => rec.current?.stop(), []);
  return { supported, listening, interim, error, start, stop };
}

export function useReadAloud() {
  const mounted = useMounted();
  const supported = mounted && typeof window !== "undefined" && "speechSynthesis" in window;
  const [enabled, setEnabled] = React.useState(false);
  const speak = React.useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = /[؀-ۿ]/.test(text) ? "ar-SA" : "en-GB";
      u.rate = 0.98;
      window.speechSynthesis.speak(u);
    },
    [supported, enabled],
  );
  const toggle = React.useCallback(() => {
    setEnabled((on) => {
      if (on && typeof window !== "undefined") window.speechSynthesis?.cancel();
      return !on;
    });
  }, []);
  React.useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);
  return { supported, enabled, toggle, speak };
}
