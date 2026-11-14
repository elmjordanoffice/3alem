import type { ReportNarrative } from "@/lib/ai/prompts/report-writer";

export interface ReportEvidence {
  id: string;
  scoreId: string;
  skillKey: string;
  level: number;
  confidence: number;
  quote: string;
  rationale: string;
  itemTitle: string;
  chapter: number;
  stage: "MAIN" | "PROBE" | "TWIST" | "ROLE_PLAY_TURN";
}

export interface ReportSkill {
  key: string;
  name: string;
  estimate: number;
  confidence: number;
  range: [number, number];
  observations: number;
  evidenceIds: string[];
  flags: string[];
  importance: "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE" | null;
}

export interface ReportDomain extends ReportSkill {
  subSkills: ReportSkill[];
}

export interface ReportContent {
  version: "report.v1";
  kind: "HIRE" | "GROW" | "TEAM_MEMBER";
  language: "en" | "ar";
  generatedAt: string;
  earlyVersion: boolean;
  candidate: { name: string };
  role: { title: string; seniority: string; family: string | null };
  fit: { level: "STRONG" | "GOOD" | "PARTIAL" | "WEAK"; confidence: number; margin: number; gaps: { key: string; name: string; gap: number }[] };
  domains: ReportDomain[];
  narrative: ReportNarrative;
  evidence: Record<string, ReportEvidence>;
  hypotheses: { skillKey: string; name: string; direction: "STRENGTH" | "WEAKNESS"; status: string; ceiling: number | null; condition: string | null }[];
  workStyle: { key: string; position: number; n: number }[];
  integrity: {
    minutesUsed: number;
    budgetMinutes: number;
    itemsCompleted: number;
    pasteEvents: number;
    tabHidden: number;
    styleShifts: number;
    inconsistentSkills: string[];
    notes: string[];
  };
  method: { scoring: "anthropic" | "offline"; scorerVersions: string[]; writer: string; engineVersion: string; doubleScoredItems: number };
}
