"use client";

import { useState, useTransition } from "react";
import { Trash2, Plus, X } from "lucide-react";
import type { FieldDef, EntryValues } from "@/lib/schema/types";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, Prompt, CheckboxField } from "@/components/ui/field";
import { LongText } from "./longtext";
import { RefPicker } from "./ref-picker";
import { cn } from "@/lib/utils";

export interface RefOption {
  id: string;
  label: string;
  moduleKey: string;
}

export function EntryForm({
  schema,
  initial,
  refOptions = [],
  onSubmit,
  onCancel,
  submitLabel = "Save",
  compact = false,
}: {
  schema: FieldDef[];
  initial?: EntryValues;
  refOptions?: RefOption[];
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  compact?: boolean;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...(initial ?? {}) }));
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, v: unknown) => setValues((s) => ({ ...s, [key]: v }));

  function submit() {
    for (const f of schema) {
      if (f.required) {
        const v = values[f.key];
        if (v == null || v === "" || (Array.isArray(v) && !v.length)) {
          setError(`${f.label} is required.`);
          return;
        }
      }
    }
    setError(null);
    start(async () => {
      await onSubmit(values);
    });
  }

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {schema.map((field) => (
        <FieldControl
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(v) => set(field.key, v)}
          refOptions={refOptions}
        />
      ))}
      {error && <p className="text-sm text-unresolved">{error}</p>}
      <div className="flex items-center gap-2 pt-1">
        <Button variant="primary" size="sm" onClick={submit} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  refOptions,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  refOptions: RefOption[];
}) {
  const id = `f-${field.key}`;
  return (
    <div className="space-y-1.5">
      {field.type !== "checklist" && (
        <Label htmlFor={id} hint={field.required ? "required" : undefined}>
          {field.label}
        </Label>
      )}
      {field.prompt && <Prompt>{field.prompt}</Prompt>}
      <FieldInput field={field} value={value} onChange={onChange} refOptions={refOptions} id={id} />
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  refOptions,
  id,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  refOptions: RefOption[];
  id: string;
}) {
  switch (field.type) {
    case "longtext":
      if (field.repeatable) return <RepeatableTextInput value={value} onChange={onChange} placeholder={field.placeholder} multiline />;
      return (
        <LongText
          value={(value as string) ?? ""}
          onChange={onChange}
          placeholder={field.placeholder ?? "Write freely…"}
        />
      );
    case "text":
      if (field.repeatable) return <RepeatableTextInput value={value} onChange={onChange} placeholder={field.placeholder} />;
      return (
        <Input
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
    case "number":
    case "money":
      return (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "money" ? "0" : field.placeholder}
        />
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: (field.max ?? 5) - (field.min ?? 1) + 1 }, (_, i) => i + (field.min ?? 1)).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(value === n ? null : n)}
              className={cn(
                "h-8 w-8 rounded-md border text-sm",
                Number(value) >= n ? "border-ink bg-ink text-surface" : "border-hairline bg-raised text-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      );
    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[12rem]"
        />
      );
    case "select":
      return (
        <Select id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      );
    case "multiselect":
      return <MultiSelect field={field} value={value} onChange={onChange} />;
    case "checklist":
      return <ChecklistInput value={value} onChange={onChange} label={field.label} />;
    case "link":
      return (
        <Input
          id={id}
          type="url"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://"
        />
      );
    case "image":
    case "file":
      return (
        <Input
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "image" ? "Image URL" : "File URL"}
        />
      );
    case "reference":
      return (
        <RefPicker
          repeatable={field.repeatable}
          value={value}
          onChange={onChange}
          options={refOptions.filter(
            (o) =>
              !field.refModules?.length ||
              field.refModules.includes("*") ||
              field.refModules.includes(o.moduleKey),
          )}
        />
      );
    default:
      return null;
  }
}

function MultiSelect({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const current = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const v = t.trim();
    if (v && !current.includes(v)) onChange([...current, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {current.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs">
            {t}
            <button type="button" onClick={() => onChange(current.filter((x) => x !== t))}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder="Add and press Enter"
          className="max-w-xs"
          list={`opts-${field.key}`}
        />
        {(field.options ?? []).length > 0 && (
          <datalist id={`opts-${field.key}`}>
            {field.options!.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}

function RepeatableTextInput({
  value,
  onChange,
  placeholder,
  multiline,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const rows = Array.isArray(value) ? (value as { value: string; note?: string }[]) : [];
  const update = (i: number, patch: Partial<{ value: string; note: string }>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-1.5">
          {multiline ? (
            <Textarea
              value={r.value}
              onChange={(e) => update(i, { value: e.target.value })}
              className="min-h-[3rem]"
            />
          ) : (
            <Input value={r.value} onChange={(e) => update(i, { value: e.target.value })} />
          )}
          <Button variant="ghost" size="icon" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...rows, { value: "" }])}>
        <Plus size={13} /> Add {placeholder ?? "another"}
      </Button>
    </div>
  );
}

function ChecklistInput({
  value,
  onChange,
  label,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  label: string;
}) {
  const items = Array.isArray(value) ? (value as { text: string; done: boolean }[]) : [];
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckboxField
            checked={it.done}
            onCheckedChange={(d) => onChange(items.map((x, idx) => (idx === i ? { ...x, done: d } : x)))}
            label={
              <input
                value={it.text}
                onChange={(e) => onChange(items.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)))}
                className="w-full bg-transparent text-sm outline-none"
              />
            }
          />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            <X size={12} className="text-muted" />
          </button>
        </div>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onChange([...items, { text: draft.trim(), done: false }]);
            setDraft("");
          }
        }}
        placeholder="Add an item, press Enter"
        className="max-w-sm"
      />
    </div>
  );
}
