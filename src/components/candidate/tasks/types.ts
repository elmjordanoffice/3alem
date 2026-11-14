import type { ItemContent } from "@/lib/assessment/item-schema";
import type { ResponseContent } from "@/lib/assessment/response-schema";
import type { SaveState } from "@/components/assessment/autosave-indicator";

export interface TaskProps {
  itemId: string;
  content: ItemContent;
  /** Called whenever the answer changes; null when it isn't complete enough to submit. */
  onChange: (value: ResponseContent | null) => void;
  onSaveState: (s: SaveState) => void;
  disabled?: boolean;
}

export const MIN_REASON = 15;
export const MIN_WRITTEN = 20;
