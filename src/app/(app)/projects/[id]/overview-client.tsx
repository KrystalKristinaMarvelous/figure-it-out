"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateProjectField, changeReadiness } from "@/lib/actions";
import { Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { READINESS_META } from "@/lib/schema/taxonomy";
import type { Readiness } from "@/lib/schema/types";

const STATUSES = [
  ["seed", "🌱 Seed"],
  ["developing", "🟡 Developing"],
  ["building", "🔵 Building"],
  ["refining", "🟠 Refining"],
  ["done", "✅ Done"],
  ["dormant", "💤 Dormant"],
] as const;

export function OneLinerEditor({
  projectId,
  value,
  original,
  readiness,
}: {
  projectId: string;
  value: string | null;
  original: string | null;
  readiness: Readiness;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          rows={3}
          className="voice-lg !text-[22px] leading-tight"
          placeholder="A princess discovers that her sister's death may have been arranged by the court."
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await updateProjectField(projectId, { one_liner: draft.trim() });
                setEditing(false);
              })
            }
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        onClick={() => setEditing(true)}
        className={`block w-full text-left ${
          value
            ? "voice-lg"
            : "voice measure text-[15px] text-unresolved-ink"
        }`}
      >
        {value ||
          (readiness === "seed"
            ? "Not sure yet? That's normal this early. Try a brainstorm — write the one-line idea here when it lands."
            : "Write the one-line version of this idea. Being unable to is real information.")}
        <Pencil
          size={13}
          className="ml-2 inline-block -translate-y-0.5 text-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
      {original && value && original !== value && (
        <p className="voice mt-2 text-[13px] italic text-faint">Started as: “{original}”</p>
      )}
    </div>
  );
}

export function StatusPicker({
  projectId,
  status,
  readiness,
}: {
  projectId: string;
  status: string;
  readiness: Readiness;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <Select
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(() => updateProjectField(projectId, { status: e.target.value }).then(() => {}))
        }
      >
        {STATUSES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <div>
        <p className="mb-1.5 text-[11.5px] text-faint">Readiness — changing only adds modules</p>
        <div className="flex gap-1.5">
          {(["seed", "vague", "defined"] as Readiness[]).map((r) => (
            <button
              key={r}
              disabled={pending || r === readiness}
              onClick={() => start(() => changeReadiness(projectId, r).then(() => {}))}
              title={READINESS_META[r].label}
              className={`pressable flex h-8 w-9 items-center justify-center rounded-[var(--radius-sm)] border text-[15px] transition-colors ${
                r === readiness
                  ? "border-ink bg-raised"
                  : "border-hairline text-muted hover:border-muted"
              }`}
            >
              {READINESS_META[r].glyph}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
