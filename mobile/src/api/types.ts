/**
 * The candidate API's shapes. Item and response content are imported (types
 * only, erased at build time) from the web app's schemas, so they can never
 * drift. CandidateView mirrors src/lib/hire/candidate-state.ts, which is
 * server-only and can't be imported into the app's type program.
 */
import type { ItemContent, ItemType } from "../../../src/lib/assessment/item-schema";
import type { ResponseContent } from "../../../src/lib/assessment/response-schema";
import type { ChartMaterial, EmailMaterial, Material, MemoMaterial, TableMaterial } from "../../../src/lib/assessment/materials";

export type { ItemContent, ItemType, ResponseContent, Material, EmailMaterial, MemoMaterial, TableMaterial, ChartMaterial };

export type Stage = "MAIN" | "PROBE" | "TWIST";

export interface PublicWorld {
  companyName: string;
  industry: string;
  premise: string;
  yourRole: string;
  team: string;
  cast: { name: string; role: string }[];
  chapters: { title: string; summary: string }[];
}

export interface Branding {
  orgName: string;
  logoUrl: string | null;
  brandColor: string | null;
}

export type TranscriptTurn = { from: "candidate" | "stakeholder"; text: string };

export type CandidateView =
  | { view: "invalid" }
  | { view: "expired" | "revoked"; branding: Branding }
  | {
      view: "landing";
      branding: Branding;
      roleTitle: string;
      minutes: number;
      candidateName: string | null;
      allowed: { extraTime: boolean; untimed: boolean; largerText: boolean };
      defaultLocale: "en" | "ar";
    }
  | { view: "briefing"; branding: Branding; world: PublicWorld; minutes: number; roleTitle: string }
  | { view: "preparing"; branding: Branding }
  | { view: "transition"; branding: Branding; world: PublicWorld; chapterIndex: number; recap: string[] }
  | {
      view: "item";
      branding: Branding;
      world: PublicWorld;
      chapterIndex: number;
      minutesLeft: number;
      untimed: boolean;
      item: {
        id: string;
        type: ItemType;
        content: ItemContent;
        stage: Stage;
        timed: boolean;
        presentedAt: string;
        roleplay?: { transcript: TranscriptTurn[] };
      };
    }
  | { view: "paused"; branding: Branding; world: PublicWorld; chapterIndex: number; minutesLeft: number }
  | { view: "complete"; branding: Branding; roleTitle: string; recap?: Recap };

/** What the candidate got through and the habits their words showed (src/lib/hire/recap.ts). Optional: older servers don't send it. */
export type RecapHabit = "reasons" | "ownership" | "checking" | "tradeoffs" | "perspective" | "specifics" | "contingency" | "options" | "calibration" | "learning" | "people";
export interface Recap {
  scenes: number;
  followUps: number;
  words: number;
  minutes: number;
  habits: RecapHabit[];
}

export type View<K extends CandidateView["view"]> = Extract<CandidateView, { view: K }>;
export type ItemView = View<"item">;

export interface StartInput {
  locale: "en" | "ar";
  extraTime: 1 | 1.25 | 1.5;
  untimed: boolean;
  largerText: boolean;
  consent: true;
  humanReview: boolean;
}

export interface IntegrityEvent {
  type: "paste" | "tab_hidden" | "focus_lost";
  at: number;
  chars?: number;
}

export interface SubmitPayload {
  itemId: string;
  stage: Stage;
  clientId: string;
  content: ResponseContent;
  durationMs: number;
  events: IntegrityEvent[];
}

export type FairnessAnswers = Partial<Record<"gender" | "ageBand" | "disability" | "firstLanguage", string>>;
