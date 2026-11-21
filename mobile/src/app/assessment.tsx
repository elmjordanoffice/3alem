import * as React from "react";
import { View } from "react-native";
import { Redirect, router } from "expo-router";
import { useT } from "../i18n";
import { useTheme } from "../theme";
import { useSession } from "../state/session";
import { AcceptedContext, useAssessment } from "../state/assessment";
import { Flow } from "../deck/flow";
import { SceneScreen, type SceneActions } from "../deck/scene";
import { Landing } from "../screens/landing";
import { Briefing } from "../screens/briefing";
import { Paused, Preparing, StateScreen, Transition } from "../screens/breaks";
import { Complete } from "../screens/complete";

/** The whole candidate journey, one screen per server view, each rising over the last. */
export default function Assessment() {
  const { api, token, clearToken } = useSession();
  const { c } = useTheme();
  const tm = useT("mobile.errors");
  const a = useAssessment(api, token);

  const actions = React.useMemo<SceneActions>(
    () => ({
      submit: a.submit,
      sendTurn: async (itemId, text, clientId) => {
        try {
          const r = await api!.roleplay({ itemId, clientId, text });
          return r.ok ? { ok: true, reply: r.reply, ended: r.ended } : { ok: false };
        } catch {
          return { ok: false };
        }
      },
    }),
    [a.submit, api],
  );

  if (!token || !api) return <Redirect href="/" />;

  const leave = async () => {
    await clearToken();
    router.replace("/");
  };

  const v = a.view;
  if (!v) {
    if (a.error) return <StateScreen kind="offline" message={a.error.status === 429 ? tm("rateLimited") : undefined} onRetry={() => void a.load()} onBack={() => router.replace("/")} />;
    return <Preparing />;
  }

  let key: string = v.view;
  let node: React.ReactNode;
  switch (v.view) {
    case "invalid":
    case "expired":
    case "revoked":
      key = "state";
      node = <StateScreen kind={v.view} branding={v.view === "invalid" ? undefined : v.branding} onBack={leave} />;
      break;
    case "preparing":
      node = <Preparing branding={v.branding} />;
      break;
    case "landing":
      node = <Landing v={v} onStart={(o) => a.act((x) => x.start(o))} />;
      break;
    case "briefing":
      node = <Briefing v={v} onBegin={() => a.act((x) => x.begin())} />;
      break;
    case "transition":
      key = `transition:${v.chapterIndex}`;
      node = <Transition v={v} onContinue={() => a.act((x) => x.continueChapter())} onPause={() => a.act((x) => x.pause())} />;
      break;
    case "paused":
      node = <Paused v={v} onResume={() => a.act((x) => x.resume())} />;
      break;
    case "complete":
      node = <Complete v={v} onFeedback={(f) => api.feedback(f)} onFairness={(x) => api.fairness(x)} />;
      break;
    case "item":
      key = `item:${v.item.id}`;
      node = <SceneScreen key={v.item.id} view={v} actions={actions} online={a.online} />;
      break;
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      {/* Context, not a prop: the scene leaving the screen keeps hearing it while it slides away. */}
      <AcceptedContext.Provider value={a.accepted}>
        <Flow flowKey={key}>{node}</Flow>
      </AcceptedContext.Provider>
    </View>
  );
}
