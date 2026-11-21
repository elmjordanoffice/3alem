import * as Crypto from "expo-crypto";

/** A fresh id per attempt (8–64 chars), so retries of the same submit are idempotent server-side. */
export function newClientId(): string {
  try {
    return Crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
