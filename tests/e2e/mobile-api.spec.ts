import { test, expect, type APIRequestContext } from "@playwright/test";
import { freshInvitation } from "./db";

/**
 * The mobile app's API (/api/m/:token) runs a whole assessment: landing,
 * consent, briefing, every scene and follow-up, chapter breaks, to completion.
 * The same code backs the web app's server actions.
 */

const TEXT = "First I would check the numbers in the materials and confirm the risk with the people involved. I would tell my manager today and agree who does what by Friday.";

type View = { view: string; item?: { id: string; stage: "MAIN" | "PROBE" | "TWIST"; type: string; content: any } };

function answerFor(v: View) {
  const item = v.item!;
  const t = item.content.task;
  if (item.stage !== "MAIN") return { kind: "written", text: TEXT };
  switch (t.kind) {
    case "choice":
      return { kind: "choice", optionId: t.options[0].id, justification: TEXT };
    case "ranking":
      return { kind: "ranking", order: t.rankItems.map((r: { id: string }) => r.id), reasoning: TEXT };
    case "allocation": {
      const rows = t.allocation.rows as { id: string }[];
      return { kind: "allocation", values: Object.fromEntries(rows.map((r, i) => [r.id, i === 0 ? t.allocation.total : 0])), reasoning: TEXT };
    }
    case "inbox": {
      const msgs = t.inbox.messages as { id: string }[];
      return { kind: "inbox", order: msgs.map((m) => m.id), triage: Object.fromEntries(msgs.map((m, i) => [m.id, i < t.inbox.replyCount ? "reply" : "later"])), replies: msgs.slice(0, t.inbox.replyCount).map((m) => ({ messageId: m.id, text: TEXT })) };
    }
    case "design":
      return { kind: "design", sections: Object.fromEntries(t.design.sections.map((s: { id: string }) => [s.id, TEXT])) };
    case "chain":
      return { kind: "chain", choices: t.chain.rounds.map((r: { id: string; options: { id: string }[] }) => ({ roundId: r.id, optionId: r.options[0]!.id, reason: TEXT })) };
    case "forced_choice":
      return { kind: "forced_choice", picks: Object.fromEntries(t.forcedChoice.pairs.map((p: { id: string }) => [p.id, "a"])) };
    case "roleplay":
      return { kind: "roleplay", transcript: [{ from: "stakeholder", text: t.roleplay.openingLine }, { from: "candidate", text: TEXT }] };
    default:
      return { kind: "written", text: TEXT };
  }
}

async function post(api: APIRequestContext, token: string, body: Record<string, unknown>) {
  const res = await api.post(`/api/m/${token}`, { data: body });
  expect(res.status(), JSON.stringify(await res.json().catch(() => ({})))).toBe(200);
  return res.json();
}

test.describe.configure({ timeout: 180_000 });

test("the mobile API runs a full assessment from invitation to completion", async ({ request }) => {
  const token = await freshInvitation(`mobile-${Date.now()}@test.aalim`, "Mina Saleh");

  const pre = await request.fetch(`/api/m/${token}`, { method: "OPTIONS" });
  expect(pre.status()).toBe(204);
  expect(pre.headers()["access-control-allow-origin"]).toBe("*");

  const landing = await (await request.get(`/api/m/${token}`)).json();
  expect(landing.view).toBe("landing");
  expect(landing.candidateName).toBe("Mina Saleh");

  // Bad input is refused without changing anything.
  const bad = await request.post(`/api/m/${token}`, { data: { action: "start", locale: "fr" } });
  expect(bad.status()).toBe(400);
  expect((await request.post(`/api/m/${token}`, { data: { action: "nope" } })).status()).toBe(400);

  let view: View = (await post(request, token, { action: "start", locale: "en", extraTime: 1, untimed: true, largerText: false, consent: true })).view;
  for (let i = 0; i < 20 && view.view === "preparing"; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    view = (await post(request, token, { action: "refresh" })).view;
  }
  expect(view.view).toBe("briefing");
  view = (await post(request, token, { action: "begin" })).view;

  const seen = new Set<string>();
  for (let step = 0; step < 120 && view.view !== "complete"; step++) {
    if (view.view === "transition") {
      view = (await post(request, token, { action: "continue" })).view;
      continue;
    }
    if (view.view === "preparing") {
      await new Promise((r) => setTimeout(r, 800));
      view = (await post(request, token, { action: "refresh" })).view;
      continue;
    }
    expect(view.view).toBe("item");
    seen.add(view.item!.type);
    if (view.item!.type === "ROLE_PLAY" && view.item!.stage === "MAIN") {
      const turn = await post(request, token, { action: "roleplay", itemId: view.item!.id, clientId: `rp-${step}-${Date.now()}`, text: TEXT });
      expect(turn.ok).toBe(true);
    }
    const res = await post(request, token, { action: "submit", itemId: view.item!.id, stage: view.item!.stage, clientId: `m-${step}-${Date.now()}`, content: answerFor(view), durationMs: 30_000, events: [] });
    expect(res.ok, res.error).toBe(true);
    view = res.view;
  }
  expect(view.view).toBe("complete");
  expect(seen.size).toBeGreaterThan(2);

  await post(request, token, { action: "feedback", rating: 5, comment: "Smooth on my phone." });
});
