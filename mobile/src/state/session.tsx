import * as React from "react";
import { createApi, DEFAULT_API_URL, type Api } from "../api/client";
import { kv, secure } from "../lib/storage";

const TOKEN_KEY = "aalim.token";
const API_KEY = "aalim:apiBase";

interface SessionValue {
  token: string | null;
  apiBase: string;
  api: Api | null;
  setToken: (t: string) => Promise<void>;
  clearToken: () => Promise<void>;
  setApiBase: (url: string) => Promise<void>;
}

const SessionContext = React.createContext<SessionValue | null>(null);

/** The invitation token (remembered in the Keychain/Keystore) and the API base URL. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = React.useState<string | null>(null);
  const [apiBase, setApiBaseState] = React.useState(DEFAULT_API_URL);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    Promise.all([secure.get(TOKEN_KEY), kv.get<string>(API_KEY)]).then(([t, base]) => {
      if (t) setTokenState(t);
      if (base) setApiBaseState(base);
      setReady(true);
    });
  }, []);

  const value = React.useMemo<SessionValue>(
    () => ({
      token,
      apiBase,
      api: token ? createApi(apiBase, token) : null,
      setToken: async (t) => {
        setTokenState(t);
        await secure.set(TOKEN_KEY, t);
      },
      clearToken: async () => {
        setTokenState(null);
        await secure.remove(TOKEN_KEY);
      },
      setApiBase: async (url) => {
        const clean = url.trim().replace(/\/+$/, "") || DEFAULT_API_URL;
        setApiBaseState(clean);
        await kv.set(API_KEY, clean);
      },
    }),
    [token, apiBase],
  );

  if (!ready) return null;
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const v = React.useContext(SessionContext);
  if (!v) throw new Error("useSession outside SessionProvider");
  return v;
}
