"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { QuestionRow } from "@/lib/supabase/database.types";
import { createQuestion, updateQuestion, resolveQuestion } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { relativeTime } from "@/lib/utils";

const PRIORITY = { blocking: "🔴", important: "🟡", minor: "🟢" } as const;
const PRIORITY_ORDER = { blocking: 0, important: 1, minor: 2 } as const;
const SOURCE_LABEL: Record<string, string> = {
  brainstorm: "from a brainstorm",
  gap: "from a gap finding",
  chaos: "from Chaos Mode",
  rant: "from a rant",
  manual: "",
};

export function QuestionsBoard({
  projectId,
  questions,
}: {
  projectId: string;
  questions: QuestionRow[];
}) {
  const [adding, setAdding] = useState("");
  const [resolving, setResolving] = useState<QuestionRow | null>(null);
  const [answer, setAnswer] = useState("");
  const [pending, start] = useTransition();

  const open = questions
    .filter((q) => q.status !== "resolved")
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        a.created_at.localeCompare(b.created_at),
    );
  const resolved = questions
    .filter((q) => q.status === "resolved")
    .sort((a, b) => (b.resolved_at ?? "").localeCompare(a.resolved_at ?? ""));

  return (
    <div className="space-y-6">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!adding.trim()) return;
          const text = adding;
          setAdding("");
          start(() => createQuestion(projectId, { text }).then(() => {}));
        }}
      >
        <Input
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          placeholder="What don't you know yet?"
        />
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          <Plus size={14} /> Add
        </Button>
      </form>

      <div className="space-y-2">
        {open.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted">
            Nothing open. Most projects start with more questions than answers — that&apos;s the point.
          </Card>
        )}
        {open.map((q) => (
          <Card key={q.id} className="p-3" tint="unresolved">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-ink">{q.text}</p>
              <span className="shrink-0 text-sm">{PRIORITY[q.priority]}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <select
                value={q.priority}
                onChange={(e) =>
                  start(() =>
                    updateQuestion(projectId, q.id, { priority: e.target.value }).then(() => {}),
                  )
                }
                className="rounded border border-hairline bg-raised px-1.5 py-0.5"
              >
                <option value="blocking">blocking</option>
                <option value="important">important</option>
                <option value="minor">minor</option>
              </select>
              <select
                value={q.status}
                onChange={(e) =>
                  start(() =>
                    updateQuestion(projectId, q.id, { status: e.target.value }).then(() => {}),
                  )
                }
                className="rounded border border-hairline bg-raised px-1.5 py-0.5"
              >
                <option value="open">open</option>
                <option value="exploring">exploring</option>
              </select>
              <button
                onClick={() => {
                  setResolving(q);
                  setAnswer("");
                }}
                className="rounded bg-ink px-2 py-0.5 text-surface"
              >
                Resolve
              </button>
              {SOURCE_LABEL[q.source] && (
                <span className="text-muted">{SOURCE_LABEL[q.source]}</span>
              )}
              <span className="text-muted">· {relativeTime(q.created_at)}</span>
            </div>
          </Card>
        ))}
      </div>

      {resolved.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-muted">
            {resolved.length} resolved — the decision history
          </summary>
          <div className="mt-3 space-y-2">
            {resolved.map((q) => (
              <Card key={q.id} className="p-3 text-sm">
                <p className="text-muted line-through decoration-muted/40">{q.text}</p>
                <p className="mt-1 text-ink">{q.answer}</p>
                <p className="mt-1 text-xs text-muted">
                  resolved {relativeTime(q.resolved_at)} ·{" "}
                  <button
                    className="underline"
                    onClick={() =>
                      start(() =>
                        updateQuestion(projectId, q.id, { status: "open" }).then(() => {}),
                      )
                    }
                  >
                    reopen
                  </button>
                </p>
              </Card>
            ))}
          </div>
        </details>
      )}

      <Dialog open={!!resolving} onOpenChange={(o) => !o && setResolving(null)}>
        <DialogContent>
          <DialogHeader
            title="Resolve this question"
            description="Marking it solved requires writing the answer. The record of what you decided is worth more than the checkbox."
          />
          <DialogBody>
            <p className="mb-2 text-sm text-ink">{resolving?.text}</p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="What did you decide?"
              autoFocus
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setResolving(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={pending || !answer.trim()}
              onClick={() =>
                start(async () => {
                  if (resolving) await resolveQuestion(projectId, resolving.id, answer);
                  setResolving(null);
                })
              }
            >
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
