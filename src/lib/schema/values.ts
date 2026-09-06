import type { ChecklistItem, EntryValues, FieldDef, RefValue, RepeatableText } from "./types";

/** Coerce a raw form value into the shape the field expects. */
export function coerceField(field: FieldDef, raw: unknown): unknown {
  switch (field.type) {
    case "number":
    case "money":
    case "rating": {
      if (raw === "" || raw === null || raw === undefined) return null;
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    case "multiselect":
      return Array.isArray(raw) ? raw.filter(Boolean) : raw ? [String(raw)] : [];
    case "checklist":
      return Array.isArray(raw)
        ? (raw as ChecklistItem[]).filter((i) => i && i.text?.trim())
        : [];
    case "reference":
      if (field.repeatable) {
        return Array.isArray(raw) ? (raw as RefValue[]).filter((r) => r?.entryId) : [];
      }
      return raw && typeof raw === "object" ? raw : raw ? { entryId: String(raw) } : null;
    default:
      if (field.repeatable) {
        return Array.isArray(raw)
          ? (raw as RepeatableText[]).filter((r) => r?.value?.trim())
          : [];
      }
      return raw === undefined ? null : raw;
  }
}

export function coerceValues(schema: FieldDef[], raw: Record<string, unknown>): EntryValues {
  const out: EntryValues = {};
  for (const f of schema) {
    out[f.key] = coerceField(f, raw[f.key]) as EntryValues[string];
  }
  return out;
}

export function titleFor(schema: FieldDef[], values: EntryValues, fallback = "Untitled"): string {
  const titleField = schema.find((f) => f.isTitle) ?? schema[0];
  if (!titleField) return fallback;
  const v = values[titleField.key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number") return String(v);
  if (Array.isArray(v) && v.length && typeof v[0] === "string") return v.join(", ");
  return fallback;
}

export function isFieldEmpty(field: FieldDef, value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/** How complete is this entry, 0..1 — shown, never scored (spec §12.3). */
export function completeness(schema: FieldDef[], values: EntryValues) {
  const relevant = schema.filter((f) => f.type !== "reference" || f.required);
  if (!relevant.length) return { filled: 0, total: 0 };
  const filled = relevant.filter((f) => !isFieldEmpty(f, values[f.key])).length;
  return { filled, total: relevant.length };
}

export function plainText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        typeof v === "string"
          ? v
          : v && typeof v === "object"
            ? (v as RepeatableText).value ?? (v as ChecklistItem).text ?? ""
            : "",
      )
      .filter(Boolean)
      .join(", ");
  }
  return "";
}
