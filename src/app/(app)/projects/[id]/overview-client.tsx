"use client";

import { useState, useTransition } from "react";
import { updateProjectField, changeReadiness } from "@/lib/actions";
import { Textarea } from "@/components/ui/field";
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

  if (!editing) {
    return (
      <div>
        <button
          onClick={() => setEditing(true)}
          className="voice block w-full text-left text-lg leading-snug text-ink"
        >
          {value || (
            <span className="text-unresolved">
              {readiness === "seed"
                ? "Not sure yet? That's normal this early. Try a brainstorm — or write the one-line idea here when it comes."
                : "Write the one-line version of this idea."}
            </span>
          )}
        </button>
        {original && value && original !== value && (
          <p className="mt-1 text-xs text-muted">Started as: “{original}”</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        className="voice text-lg"
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
      <select
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(() => updateProjectField(projectId, { status: e.target.value }).then(() => {}))
        }
        className="w-full rounded-md border border-hairline bg-raised px-2 py-1.5 text-sm"
      >
        {STATUSES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <div>
        <p className="mb-1 text-xs text-muted">Readiness (changing only adds modules)</p>
        <div className="flex gap-1">
          {(["seed", "vague", "defined"] as Readiness[]).map((r) => (
            <button
              key={r}
              disabled={pending || r === readiness}
              onClick={() => start(() => changeReadiness(projectId, r).then(() => {}))}
              className={`rounded-md border px-2 py-1 text-sm ${
                r === readiness ? "border-ink bg-raised" : "border-hairline text-muted"
              }`}
              title={READINESS_META[r].label}
            >
              {READINESS_META[r].glyph}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
