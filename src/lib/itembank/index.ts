import type { BankItem } from "@/lib/assessment/item-schema";
import { ITEMS as dilemmas } from "./items/dilemmas";
import { ITEMS as ranking } from "./items/ranking";
import { ITEMS as cases } from "./items/cases";
import { ITEMS as chains } from "./items/chains";
import { ITEMS as reflection } from "./items/reflection";
import { ITEMS as inbox } from "./items/inbox";
import { ITEMS as roleplay } from "./items/roleplay";
import { ITEMS as written } from "./items/written";
import { ITEMS as design } from "./items/design";
import { ITEMS as technical } from "./items/technical";
import { ITEMS as workstyle } from "./items/workstyle";

/**
 * The curated item bank: human-reviewed items used when no language model is
 * configured, as a fallback when generation fails, and as calibration anchors.
 */
export const BANK: BankItem[] = [
  ...dilemmas,
  ...ranking,
  ...cases,
  ...chains,
  ...reflection,
  ...inbox,
  ...roleplay,
  ...written,
  ...design,
  ...technical,
  ...workstyle,
];

export { WORLDS } from "./worlds";
