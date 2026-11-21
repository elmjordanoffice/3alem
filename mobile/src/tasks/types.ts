import type * as React from "react";
import type { ItemContent, ItemView, ResponseContent, Stage } from "../api/types";
import type { SaveState } from "../state/drafts";

/** Same thresholds as the web (src/components/candidate/tasks/types.ts). */
export const MIN_REASON = 15;
export const MIN_WRITTEN = 20;

export interface TaskContext {
  item: ItemView["item"];
  content: ItemContent;
  /** The stage being answered now. */
  stage: Stage;
  /** True while the answer is being sent, or once this stage is behind us. */
  locked: boolean;
  onSaveState: (s: SaveState) => void;
  /** Page to the next slide (after a selection, like a tap-to-advance story). */
  next: () => void;
  /** Page to a slide of this task by its key. */
  goToKey: (key: string) => void;
  timeUp: boolean;
  /** Turns the deck's paging on and off (a ranking drag owns the finger). */
  setPagingEnabled: (on: boolean) => void;
  sendTurn: (text: string, clientId: string) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
}

export interface SlideSpec {
  key: string;
  node: React.ReactNode;
  /**
   * A gate: the deck won't page past this slide until it is answered (the next
   * round of a chain depends on this one, a forced-choice pair needs a pick).
   */
  gate?: boolean;
  /** The hint on the page's "next" control, when it isn't the generic one. */
  nextLabel?: string;
  /** The card's material: paper (the default), or ink for the scene's cover, which draws edge to edge. */
  tone?: "paper" | "ink";
}

export interface TaskResult {
  slides: SlideSpec[];
  /** The complete answer, or null while it isn't ready to submit. */
  value: ResponseContent | null;
  /** A read-only digest shown once this stage is sealed. */
  summary: React.ReactNode;
}
