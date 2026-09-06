"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { RefOption } from "./entry-form";

export function RefPicker({
  value,
  onChange,
  options,
  repeatable,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  options: RefOption[];
  repeatable?: boolean;
}) {
  if (repeatable) {
    const rows = Array.isArray(value) ? (value as { entryId: string; note?: string }[]) : [];
    return (
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <select
              value={r.entryId}
              onChange={(e) =>
                onChange(rows.map((x, idx) => (idx === i ? { ...x, entryId: e.target.value } : x)))
              }
              className="rounded-md border border-hairline bg-raised px-2 py-1.5 text-sm"
            >
              <option value="">Choose…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="what it costs them / note"
              value={r.note ?? ""}
              onChange={(e) => onChange(rows.map((x, idx) => (idx === i ? { ...x, note: e.target.value } : x)))}
            />
            <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}>
              <X size={13} className="text-muted" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, { entryId: "" }])}>
          <Plus size={13} /> Add link
        </Button>
        {options.length === 0 && (
          <p className="text-xs text-muted">Nothing to link to yet — add entries there first.</p>
        )}
      </div>
    );
  }

  const single = value && typeof value === "object" ? (value as { entryId: string }) : null;
  const [note, setNote] = useState((value as { note?: string })?.note ?? "");
  return (
    <select
      value={single?.entryId ?? ""}
      onChange={(e) => onChange(e.target.value ? { entryId: e.target.value, note } : null)}
      className="rounded-md border border-hairline bg-raised px-2 py-1.5 text-sm"
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
