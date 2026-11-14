import { DOMAINS } from "@/lib/framework/data";
import {
  buildRoleProfile,
  chapterFor,
  createModel,
  estimateDomain,
  estimateSkill,
  recordItem,
  recordWorkStyle,
  reviewHypotheses,
  selectNextTarget,
  shouldStop,
  updateModel,
  type CandidateModel,
  type RoleProfile,
  type RoleProfileInput,
  type Target,
} from "@/lib/engine";

/** Small seeded PRNG so simulations are reproducible. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(r: () => number) {
  const u = Math.max(1e-9, r());
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface Persona {
  id: string;
  description: string;
  /** True level per domain; sub-skills vary around it. */
  domains: Record<string, number>;
  /** Explicit sub-skill overrides. */
  overrides?: Record<string, number>;
  /** Sub-skills that drop under time pressure. */
  weakUnderPressure?: string[];
  /** Work-style leaning per style: probability of choosing pole b. */
  styles?: Record<string, number>;
}

const D = (base: number, over: Partial<Record<string, number>> = {}) =>
  Object.fromEntries(DOMAINS.map((d) => [d.key, over[d.key] ?? base])) as Record<string, number>;

export const PERSONAS: Persona[] = [
  { id: "p01", description: "Strong leader, weak communicator", domains: D(3, { leadership: 4.5, communication: 2, management: 3.8 }) },
  { id: "p02", description: "Brilliant technician with product instincts", domains: D(3, { technical: 4.8, "product-thinking": 4.3, communication: 2.7, leadership: 2.5 }) },
  { id: "p03", description: "Solid all-rounder", domains: D(3) },
  { id: "p04", description: "Junior with high learning speed", domains: D(2.4, { adaptability: 4.4, "critical-thinking": 3.2 }) },
  { id: "p05", description: "Experienced manager, rigid under change", domains: D(3.6, { management: 4.4, adaptability: 1.9 }) },
  { id: "p06", description: "Analytical, weak with people", domains: D(3, { "critical-thinking": 4.6, technical: 4, collaboration: 1.9, communication: 2.3 }) },
  { id: "p07", description: "Empathetic team player, hesitant decider", domains: D(3, { collaboration: 4.5, communication: 4, judgment: 2.2 }) },
  { id: "p08", description: "Impulsive decider", domains: D(3, { judgment: 1.8, adaptability: 3.6, leadership: 3.6 }) },
  { id: "p09", description: "Expert across the board", domains: D(4.6) },
  { id: "p10", description: "Struggling across the board", domains: D(1.8) },
  {
    id: "p11",
    description: "Good when calm, weak under time pressure",
    domains: D(3.4, { adaptability: 2.6 }),
    weakUnderPressure: ["management.planning-prioritisation", "judgment.trade-off-reasoning", "communication.clarity-structure"],
  },
  { id: "p12", description: "Hidden management talent in a technical role", domains: D(3, { technical: 3.5, management: 4.5, judgment: 4.2 }) },
  { id: "p13", description: "Persuasive communicator, shallow analysis", domains: D(3, { communication: 4.6, "critical-thinking": 2, technical: 2.5 }) },
  { id: "p14", description: "Ethically strong, conflict-averse", domains: D(3.2), overrides: { "judgment.ethical-judgment": 4.8, "leadership.handling-conflict": 1.6, "leadership.courage": 2 } },
  { id: "p15", description: "Creative product thinker, disorganised", domains: D(3, { "product-thinking": 4.7, management: 1.9 }) },
  { id: "p16", description: "Steady operator, low ambiguity tolerance", domains: D(3.3), overrides: { "adaptability.comfort-with-ambiguity": 1.5, "judgment.deciding-under-ambiguity": 2 } },
  { id: "p17", description: "Senior strategist", domains: D(4, { leadership: 4.6, judgment: 4.5, technical: 3 }) },
  { id: "p18", description: "Great coach, poor delegator", domains: D(3.4), overrides: { "leadership.developing-others": 4.8, "management.delegation": 1.6 } },
  { id: "p19", description: "Numbers person", domains: D(3), overrides: { "critical-thinking.quantitative-reasoning": 4.9, "critical-thinking.evaluating-evidence": 4.4, "communication.adapting-to-audience": 2 } },
  { id: "p20", description: "Uneven: strong technical, weak everything else", domains: D(2.1, { technical: 4.7 }) },
  { id: "p21", description: "Mid-level, slightly above average", domains: D(3.4) },
  { id: "p22", description: "Mid-level, slightly below average", domains: D(2.6) },
  { id: "p23", description: "Collaborative influencer", domains: D(3.2, { collaboration: 4.2, leadership: 4 }), overrides: { "leadership.influence-without-authority": 4.8 } },
  { id: "p24", description: "Detail-focused, misses the big picture", domains: D(3), overrides: { "judgment.second-order-thinking": 1.7, "leadership.setting-direction": 2, "critical-thinking.spotting-assumptions": 4.2 } },
  { id: "p25", description: "Calm under fire", domains: D(3.2, { adaptability: 4.6 }) },
  { id: "p26", description: "Listener, not a persuader", domains: D(3.1), overrides: { "communication.listening": 4.8, "communication.persuasion": 1.8 } },
  { id: "p27", description: "Escalates too much", domains: D(3), overrides: { "judgment.knowing-when-to-escalate": 1.6, "leadership.ownership": 2.2 } },
  { id: "p28", description: "High performer, low self-awareness", domains: D(4, { collaboration: 2.6 }), overrides: { "collaboration.self-awareness": 1.6, "collaboration.taking-feedback": 1.8 } },
  { id: "p29", description: "Spiky expert", domains: D(2.8, { "critical-thinking": 4.8, "product-thinking": 4.4 }) },
  { id: "p30", description: "Random profile", domains: D(3, { technical: 2.2, "critical-thinking": 3.9, judgment: 3.1, leadership: 2.4, management: 4.1, communication: 3.6, "product-thinking": 2.9, collaboration: 3.3, adaptability: 4 }) },
];

/** True level for every sub-skill, deterministic per persona. */
export function trueLevels(p: Persona): Record<string, number> {
  const r = rng(hash(p.id));
  const out: Record<string, number> = {};
  for (const d of DOMAINS) {
    for (const s of d.subSkills) {
      const v = p.overrides?.[s.key] ?? p.domains[d.key]! + (r() - 0.5) * 0.8;
      out[s.key] = Math.min(5, Math.max(1, v));
    }
  }
  return out;
}

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Simulated performance: people can only show as much as an item allows. */
function perform(trueLevel: number, difficulty: number, timed: boolean, weak: boolean, r: () => number) {
  let shown = Math.min(trueLevel, difficulty + 1) + gaussian(r) * 0.5;
  if (timed && weak) shown -= 1.3;
  return Math.min(5, Math.max(1, Math.round(shown)));
}

export const DEFAULT_ROLE: RoleProfileInput = {
  domainWeights: { technical: 0.8, "critical-thinking": 0.7, judgment: 0.7, communication: 0.6, leadership: 0.4, management: 0.5, "product-thinking": 0.4, collaboration: 0.5, adaptability: 0.5 },
  importance: [
    { key: "technical", importance: "MUST_HAVE" },
    { key: "critical-thinking", importance: "MUST_HAVE" },
    { key: "communication", importance: "NICE_TO_HAVE" },
  ],
  seniority: "mid",
  technicalSkills: [],
};

export interface SimulationResult {
  model: CandidateModel;
  role: RoleProfile;
  truth: Record<string, number>;
  targets: Target[];
  elapsed: number;
}

/** Run one persona through the engine with a synthetic item for every target. */
export function simulate(p: Persona, roleInput: RoleProfileInput = DEFAULT_ROLE, totalMinutes = 50, seed = 7): SimulationResult {
  const role = buildRoleProfile(roleInput);
  const truth = trueLevels(p);
  const r = rng(hash(p.id) ^ seed);
  let model = createModel(role);
  let elapsed = 0;
  const targets: Target[] = [];
  let n = 0;

  while (!shouldStop(model, role, { totalMinutes, elapsedMinutes: elapsed })) {
    const target = selectNextTarget(model, role, { totalMinutes, elapsedMinutes: elapsed });
    if (!target) break;
    targets.push(target);
    const itemId = `item-${++n}`;
    const chapter = chapterFor({ totalMinutes, elapsedMinutes: elapsed });
    model = recordItem(model, {
      itemId,
      type: target.itemType,
      difficulty: target.difficulty,
      targets: target.skills,
      minutes: target.estMinutes,
      chapter,
      purpose: target.purpose,
      timed: target.timed,
      hypothesisId: target.hypothesisId,
    });
    const item = { itemId, type: target.itemType, difficulty: target.difficulty, timed: target.timed };

    if (target.itemType === "FORCED_CHOICE_WORK_STYLE") {
      const picks = ["workstyle.risk", "workstyle.pace", "workstyle.focus", "workstyle.mode"].flatMap((style) =>
        [0, 1].map(() => ({ style, pole: (r() < (p.styles?.[style] ?? 0.5) ? "b" : "a") as "a" | "b" })),
      );
      model = recordWorkStyle(model, picks);
    } else {
      const score = (key: string) => {
        const t = truth[key] ?? 3;
        const weak = p.weakUnderPressure?.includes(key) ?? false;
        return { competencyKey: key, level: perform(t, target.difficulty, target.timed, weak, r), confidence: 0.55 + r() * 0.4, evidenceQuote: "…" };
      };
      model = updateModel(model, { item, stage: "MAIN", scores: target.skills.map(score) });
      model = updateModel(model, { item, stage: "PROBE", scores: [score(target.skills[0]!)] });
      if (target.itemType !== "REFLECTION") {
        model = updateModel(model, { item, stage: "TWIST", scores: [score("adaptability.handling-new-information")] });
      }
    }
    model = reviewHypotheses(model, role);
    elapsed += target.estMinutes;
  }
  return { model, role, truth, targets, elapsed };
}

export interface RecoveryStats {
  measured: { within: number; total: number };
  all: { within: number; total: number };
  domains: { within: number; total: number };
}

export function recovery(sim: SimulationResult): RecoveryStats {
  const stats: RecoveryStats = { measured: { within: 0, total: 0 }, all: { within: 0, total: 0 }, domains: { within: 0, total: 0 } };
  for (const [key, t] of Object.entries(sim.truth)) {
    if (!sim.model.skills[key]) continue;
    const e = estimateSkill(sim.model, key);
    const ok = Math.abs(e.mean - t) <= 1;
    stats.all.total++;
    if (ok) stats.all.within++;
    if (e.observations > 0) {
      stats.measured.total++;
      if (ok) stats.measured.within++;
    }
  }
  for (const d of DOMAINS) {
    const keys = d.subSkills.map((s) => s.key);
    const trueMean = keys.reduce((a, k) => a + (sim.truth[k] ?? 3), 0) / keys.length;
    const e = estimateDomain(sim.model, d.key);
    stats.domains.total++;
    if (Math.abs(e.mean - trueMean) <= 1) stats.domains.within++;
  }
  return stats;
}
