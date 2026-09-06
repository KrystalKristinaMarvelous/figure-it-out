"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateProjectField, changeReadiness } from "@/lib/actions";
import { Textarea, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ReadinessMark } from "@/components/readiness-mark";
import { READINESS_META } from "@/lib/schema/taxonomy";
import type { Readiness } from "@/lib/schema/types";

const STATUSES: [string, string, string][] = [
  ["seed", "Seed", "var(--faint)"],
  ["developing", "Developing", "var(--brass)"],
  ["building", "Building", "var(--denim)"],
  ["refining", "Refining", "var(--accent)"],
  ["done", "Done", "var(--ok)"],
  ["dormant", "Dormant", "var(--hairline)"],
];

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
          className="voice-lg !text-[24px] leading-tight"
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
    <div className="group">
      <button
        onClick={() => setEditing(true)}
        className={`block w-full text-left ${
          value ? "voice-xl" : "voice measure text-[15px] text-accent-ink"
        }`}
      >
        {value ||
          (readiness === "seed"
            ? "Not sure yet? That's normal this early. Try a brainstorm — write the one-line idea here when it lands."
            : "Write the one-line version of this idea. Being unable to is real information.")}
        <Pencil
          size={13}
          className="ml-2 inline-block -translate-y-1 text-faint opacity-0 transition-opacity group-hover:opacity-100"
        />
      </button>
      {original && value && original !== value && (
        <p className="voice mt-3 text-[13px] italic text-faint">Started as: “{original}”</p>
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
  const current = STATUSES.find(([v]) => v === status);
  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: current?.[2] ?? "var(--faint)" }}
        />
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
      </div>
      <div>
        <p className="mb-2 text-[11px] text-faint">Readiness — changing only adds modules</p>
        <div className="flex gap-2">
          {(["seed", "vague", "defined"] as Readiness[]).map((r) => (
            <button
              key={r}
              disabled={pending || r === readiness}
              onClick={() => start(() => changeReadiness(projectId, r).then(() => {}))}
              title={READINESS_META[r].label}
              className={`flex h-9 flex-1 items-center justify-center rounded-[var(--radius-sm)] border transition-colors ${
                r === readiness
                  ? "border-accent bg-accent-wash/40"
                  : "border-hairline text-muted hover:border-ink-2"
              }`}
            >
              <ReadinessMark readiness={r} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
