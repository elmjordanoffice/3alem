import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Device storage. Drafts, the outbox and preferences go to AsyncStorage
 * (localStorage on web); the invitation token, the only credential, goes to the
 * Keychain / Keystore through expo-secure-store, falling back to AsyncStorage
 * on web. Every call swallows storage errors: losing a cache never breaks a
 * screen, and the server stays the source of truth.
 */
export const kv = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: unknown): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
  async keys(prefix: string): Promise<string[]> {
    try {
      return (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
  async multiGet<T>(keys: string[]): Promise<Record<string, T>> {
    const out: Record<string, T> = {};
    if (!keys.length) return out;
    try {
      for (const [k, raw] of await AsyncStorage.multiGet(keys)) if (raw) out[k] = JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return out;
  },
};

const SECURE = Platform.OS !== "web";
// SecureStore keys allow only [A-Za-z0-9._-].
const secureKey = (k: string) => k.replace(/[^A-Za-z0-9._-]/g, "_");

export const secure = {
  async get(key: string): Promise<string | null> {
    try {
      return SECURE ? await SecureStore.getItemAsync(secureKey(key)) : await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      if (SECURE) await SecureStore.setItemAsync(secureKey(key), value, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK });
      else await AsyncStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (SECURE) await SecureStore.deleteItemAsync(secureKey(key));
      else await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
