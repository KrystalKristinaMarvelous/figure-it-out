/**
 * The engine's type system (spec §5.1). A module is a schema; entries are rows
 * validated against it. Everything else is a service or presentation over these.
 */

export type FieldType =
  | "text"
  | "longtext"
  | "select"
  | "multiselect"
  | "date"
  | "number"
  | "money"
  | "rating"
  | "checklist"
  | "image"
  | "file"
  | "link"
  | "reference";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  /** The app's voice — one line under the field. This carries the craft. */
  prompt?: string;
  placeholder?: string;
  repeatable?: boolean;
  required?: boolean;
  /** for select / multiselect */
  options?: string[];
  /** for reference — which module key(s) this points at */
  refModules?: string[];
  /** for number / money / rating */
  min?: number;
  max?: number;
  /** mark this the entry's display title */
  isTitle?: boolean;
  /** structural slot key — used by `slots` presentation and gap rules */
  slot?: string;
}

export type Presentation =
  | "sheet"
  | "slots"
  | "list"
  | "board"
  | "table"
  | "timeline"
  | "gallery"
  | "grid"
  | "canvas";

export type GapRuleType =
  | "field_empty" // a key field has no value on some entry
  | "no_entries" // module has zero entries
  | "min_entries" // fewer than N entries
  | "required_pairing" // if field A set, field B must be set
  | "orphaned_reference" // entry referenced nowhere
  | "empty_slot" // a structural slot has no entry
  | "stale_question"; // handled globally, listed for completeness

export interface GapRule {
  type: GapRuleType;
  field?: string;
  pairWith?: string;
  min?: number;
  /** the question the app asks when the gap is present — the app's voice */
  message: string;
  /** blocking-ish weighting for ordering; not a badge */
  weight?: number;
}

export interface ModuleDef {
  key: string;
  name: string;
  /** lucide icon name */
  icon: string;
  presentation: Presentation;
  intro: string;
  entrySchema: FieldDef[];
  gapRules?: GapRule[];
  suggestedWith?: string[];
  /** which categories this module belongs to; [] = universal */
  categoryAffinity?: string[];
  universal?: boolean;
  /** plural noun for Pulse counts, e.g. "characters" */
  plural?: string;
  /** default entry sort */
  defaultSort?: "order" | "created" | "title" | "date";
}

export type EntryValue =
  | string
  | number
  | null
  | string[]
  | ChecklistItem[]
  | RefValue[]
  | RepeatableText[];

export interface ChecklistItem {
  text: string;
  done: boolean;
}
export interface RefValue {
  entryId: string;
  note?: string;
}
export interface RepeatableText {
  value: string;
  note?: string;
}

export type EntryValues = Record<string, EntryValue>;

// ── the four axis-1 taxonomy ─────────────────────────────────────────────────
export const CATEGORIES = [
  "creative",
  "academic",
  "professional",
  "personal",
  "custom",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const READINESS = ["seed", "vague", "defined"] as const;
export type Readiness = (typeof READINESS)[number];
