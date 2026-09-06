"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, ChevronDown } from "lucide-react";
import type { QuestionRow } from "@/lib/supabase/database.types";
import { createQuestion, updateQuestion, resolveQuestion } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { relativeTime, cn } from "@/lib/utils";

const PRIORITY_DOT = { blocking: "bg-accent", important: "bg-muted", minor: "bg-faint" } as const;
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
  const [draining, setDraining] = useState<string | null>(null);
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

  function doResolve() {
    if (!resolving) return;
    const id = resolving.id;
    setDraining(id);
    setResolving(null);
    start(async () => {
      // let the drain animation play before the row leaves
      await new Promise((r) => setTimeout(r, 480));
      await resolveQuestion(projectId, id, answer);
      setDraining(null);
      setAnswer("");
    });
  }

  return (
    <div className="space-y-7">
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
          className="h-9"
        />
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          <Plus size={14} /> Add
        </Button>
      </form>

      <div>
        {open.length === 0 && (
          <p className="voice py-6 text-[14px] text-muted">
            Nothing open. Most projects start with more questions than answers — that&apos;s the
            point.
          </p>
        )}
        <div className="hairline-x framed">
          {open.map((q) => (
            <div
              key={q.id}
              className={cn(
                "open-edge py-3.5 pl-4",
                draining === q.id && "animate-drain pointer-events-none",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[q.priority])}
                  title={q.priority}
                />
                <p className="voice flex-1 text-[15.5px] leading-snug text-ink">{q.text}</p>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-4 text-[11px]">
                <InlineSelect
                  value={q.priority}
                  onChange={(v) => start(() => updateQuestion(projectId, q.id, { priority: v }).then(() => {}))}
                  options={["blocking", "important", "minor"]}
                />
                <InlineSelect
                  value={q.status}
                  onChange={(v) => start(() => updateQuestion(projectId, q.id, { status: v }).then(() => {}))}
                  options={["open", "exploring"]}
                />
                <button
                  onClick={() => {
                    setResolving(q);
                    setAnswer("");
                  }}
                  className="pressable ml-1 text-[11px] font-medium text-accent-ink hover:underline"
                >
                  Resolve
                </button>
                {SOURCE_LABEL[q.source] && (
                  <span className="mono text-[10px] uppercase tracking-[0.05em] text-faint">
                    {SOURCE_LABEL[q.source]}
                  </span>
                )}
                <span className="mono text-[10px] text-faint">· {relativeTime(q.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resolved.length > 0 && (
        <details className="group">
          <summary className="mono flex cursor-pointer list-none items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted hover:text-ink">
            <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
            {resolved.length} resolved — the decision history
          </summary>
          <div className="mt-4 hairline-x framed">
            {resolved.map((q) => (
              <div key={q.id} className="py-3.5">
                <p className="voice text-[13px] text-faint line-through decoration-faint/40">
                  {q.text}
                </p>
                <p className="voice mt-1 text-[14.5px] text-ink">{q.answer}</p>
                <p className="mono mt-1.5 text-[10px] text-faint">
                  resolved {relativeTime(q.resolved_at)} ·{" "}
                  <button
                    className="underline hover:text-muted"
                    onClick={() =>
                      start(() => updateQuestion(projectId, q.id, { status: "open" }).then(() => {}))
                    }
                  >
                    reopen
                  </button>
                </p>
              </div>
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
            <p className="voice mb-3 text-[15px] text-ink">{resolving?.text}</p>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="What did you decide?"
              autoFocus
              className="min-h-[6rem]"
            />
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setResolving(null)}>
              Cancel
            </Button>
            <Button
              variant="unresolved"
              size="sm"
              disabled={pending || !answer.trim()}
              onClick={doResolve}
            >
              Resolve it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <span className="relative inline-flex items-center text-muted hover:text-ink">
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono cursor-pointer appearance-none bg-transparent pr-3.5 text-[10px] uppercase tracking-[0.05em] outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={9} className="pointer-events-none absolute right-0" />
    </span>
  );
}
