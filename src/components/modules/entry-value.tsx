import type { FieldDef, EntryValues } from "@/lib/schema/types";
import { money, shortDate } from "@/lib/format";
import { RichText } from "@/components/fields/longtext";

export function FieldValue({
  field,
  value,
  refLabels,
}: {
  field: FieldDef;
  value: unknown;
  refLabels?: Map<string, string>;
}) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-muted">—</span>;
  }
  switch (field.type) {
    case "longtext":
      return field.repeatable ? (
        <ul className="list-disc space-y-0.5 pl-4">
          {(value as { value: string }[]).map((r, i) => (
            <li key={i}>{r.value}</li>
          ))}
        </ul>
      ) : (
        <RichText html={value as string} />
      );
    case "money":
      return <span>{money(Number(value))}</span>;
    case "number":
    case "rating":
      return <span>{String(value)}</span>;
    case "date":
      return <span>{shortDate(value as string)}</span>;
    case "multiselect":
      return (
        <span className="flex flex-wrap gap-1">
          {(value as string[]).map((t) => (
            <span key={t} className="rounded-full bg-sunken px-1.5 py-0.5 text-xs">
              {t}
            </span>
          ))}
        </span>
      );
    case "checklist": {
      const items = value as { text: string; done: boolean }[];
      const done = items.filter((i) => i.done).length;
      return (
        <span className="text-xs text-muted">
          {done}/{items.length} done
        </span>
      );
    }
    case "link":
      return (
        <a href={value as string} target="_blank" rel="noreferrer" className="text-unresolved underline">
          link
        </a>
      );
    case "image":
      return <img src={value as string} alt="" className="max-h-40 rounded-md object-cover" />;
    case "file":
      return (
        <a href={value as string} target="_blank" rel="noreferrer" className="text-unresolved underline">
          file
        </a>
      );
    case "reference": {
      const rows = field.repeatable
        ? (value as { entryId: string; note?: string }[])
        : [value as { entryId: string; note?: string }];
      return (
        <span className="flex flex-wrap gap-1">
          {rows.map((r, i) => (
            <span key={i} className="rounded bg-sunken px-1.5 py-0.5 text-xs">
              {refLabels?.get(r.entryId) ?? "linked"}
              {r.note ? ` — ${r.note}` : ""}
            </span>
          ))}
        </span>
      );
    }
    default:
      return <span>{String(value)}</span>;
  }
}

export function summarize(schema: FieldDef[], values: EntryValues, skipTitle = true): string {
  const parts: string[] = [];
  for (const f of schema) {
    if (skipTitle && f.isTitle) continue;
    const v = values[f.key];
    if (v == null || v === "" || (Array.isArray(v) && !v.length)) continue;
    if (typeof v === "string") {
      parts.push(v.replace(/<[^>]+>/g, " ").trim());
    } else if (typeof v === "number") {
      parts.push(String(v));
    }
    if (parts.join(" ").length > 140) break;
  }
  return parts.join(" · ").slice(0, 160);
}
