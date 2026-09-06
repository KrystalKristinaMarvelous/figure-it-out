"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import type { BrainstormResponseRow } from "@/lib/supabase/database.types";
import {
  saveBrainstormResponse,
  routeBrainstormAnswer,
  closeBrainstorm,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/field";

interface Prompt {
  key: string;
  topic: string;
  question: string;
  hint: string | null;
  alternates: string[];
}

export function BrainstormSession({
  projectId,
  sessionId,
  status,
  prompts,
  responses,
  targets,
}: {
  projectId: string;
  sessionId: string;
  status: string;
  prompts: Prompt[];
  responses: BrainstormResponseRow[];
  targets: { pmId: string; name: string }[];
}) {
  const answered = useMemo(
    () => new Set(responses.map((r) => r.prompt_key)),
    [responses],
  );
  const firstUnanswered = prompts.findIndex((p) => !answered.has(p.key));
  const [idx, setIdx] = useState(firstUnanswered < 0 ? prompts.length : firstUnanswered);
  const [reviewing, setReviewing] = useState(status === "reviewed" || firstUnanswered < 0);

  if (prompts.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted">
        No prompts for the chosen topics yet. Try a different topic set.
      </Card>
    );
  }

  if (reviewing || idx >= prompts.length) {
    return (
      <Review
        projectId={projectId}
        sessionId={sessionId}
        responses={responses}
        targets={targets}
        onBack={() => {
          setReviewing(false);
          setIdx(Math.max(0, prompts.length - 1));
        }}
        closed={status === "reviewed"}
      />
    );
  }

  return (
    <PromptCard
      key={prompts[idx].key}
      projectId={projectId}
      sessionId={sessionId}
      prompt={prompts[idx]}
      orderIndex={idx}
      total={prompts.length}
      onNext={() => setIdx((i) => i + 1)}
      onReview={() => setReviewing(true)}
    />
  );
}

function PromptCard({
  projectId,
  sessionId,
  prompt,
  orderIndex,
  total,
  onNext,
  onReview,
}: {
  projectId: string;
  sessionId: string;
  prompt: Prompt;
  orderIndex: number;
  total: number;
  onNext: () => void;
  onReview: () => void;
}) {
  const [answers, setAnswers] = useState<string[]>([""]);
  const [angle, setAngle] = useState(0);
  const [pending, start] = useTransition();

  const question =
    angle === 0 ? prompt.question : prompt.alternates[(angle - 1) % prompt.alternates.length];

  function persist(extra: string[] = []) {
    return saveBrainstormResponse(projectId, sessionId, {
      promptKey: prompt.key,
      promptText: prompt.question,
      answers: [...answers, ...extra],
      orderIndex,
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6" key={prompt.key + angle}>
      <div className="flex items-center gap-2">
        <span className="tnum text-[11.5px] text-faint">
          {orderIndex + 1} / {total}
        </span>
        <span className="h-1 w-1 rounded-full bg-hairline" />
        <span className="text-[11.5px] capitalize text-faint">
          {prompt.topic.replace(/_/g, " ")}
        </span>
      </div>
      <h2 className="voice-xl animate-rise">{question}</h2>
      {prompt.hint && angle === 0 && (
        <p className="voice measure text-[14px] text-muted">{prompt.hint}</p>
      )}

      <div className="space-y-2">
        {answers.map((a, i) => (
          <Textarea
            key={i}
            value={a}
            onChange={(e) => setAnswers((s) => s.map((x, idx) => (idx === i ? e.target.value : x)))}
            placeholder={i === 0 ? "One possibility…" : "Another possibility…"}
            className="min-h-[3.25rem] text-[14px]"
          />
        ))}
        <button
          onClick={() => setAnswers((s) => [...s, ""])}
          className="flex items-center gap-1.5 text-[12.5px] text-unresolved hover:underline"
        >
          <Plus size={13} /> add another possibility
        </button>
      </div>
      <p className="text-[11.5px] text-faint">
        One answer is a form. Five is a brainstorm. Star a favourite later, or don&apos;t.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => start(async () => { await persist(); onNext(); })}
        >
          Skip
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await persist(["__dont_know__"]);
              onNext();
            })
          }
        >
          I don&apos;t know yet
        </Button>
        {prompt.alternates.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setAngle((a) => a + 1)}>
            <RefreshCw size={12} /> Another angle
          </Button>
        )}
        <Button
          variant="primary"
          size="sm"
          className="ml-auto"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await persist();
              if (orderIndex + 1 >= total) onReview();
              else onNext();
            })
          }
        >
          Next <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );
}

function Review({
  projectId,
  sessionId,
  responses,
  targets,
  onBack,
  closed,
}: {
  projectId: string;
  sessionId: string;
  responses: BrainstormResponseRow[];
  targets: { pmId: string; name: string }[];
  onBack: () => void;
  closed: boolean;
}) {
  const [pending, start] = useTransition();
  const items = responses.flatMap((r) =>
    (r.answers as string[])
      .filter((a) => a && a !== "__dont_know__")
      .map((a) => ({ responseId: r.id, prompt: r.prompt_text, answer: a, disposition: r.disposition })),
  );

  return (
    <div className="mx-auto max-w-xl space-y-4 py-4">
      <h2 className="voice-lg">Review</h2>
      <p className="text-sm text-muted">
        Send an answer to a module, keep it as an idea, or discard it. Nothing auto-commits.
      </p>
      {items.length === 0 && <p className="text-sm text-muted">No answers to review.</p>}
      {items.map((it, i) => (
        <Card key={`${it.responseId}-${i}`} className="p-3">
          <p className="text-xs text-muted">{it.prompt}</p>
          <p className="mt-1 text-sm text-ink">{it.answer}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <select
              defaultValue=""
              disabled={pending}
              onChange={(e) =>
                e.target.value &&
                start(() =>
                  routeBrainstormAnswer(projectId, it.responseId, it.answer, "sent", e.target.value).then(
                    () => {},
                  ),
                )
              }
              className="rounded border border-hairline bg-raised px-1.5 py-0.5"
            >
              <option value="">Send to module…</option>
              {targets.map((t) => (
                <option key={t.pmId} value={t.pmId}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="rounded bg-sunken px-2 py-0.5"
              disabled={pending}
              onClick={() =>
                start(() =>
                  routeBrainstormAnswer(projectId, it.responseId, it.answer, "kept").then(() => {}),
                )
              }
            >
              Keep as idea
            </button>
            <button
              className="rounded px-2 py-0.5 text-muted"
              disabled={pending}
              onClick={() =>
                start(() =>
                  routeBrainstormAnswer(projectId, it.responseId, it.answer, "discarded").then(
                    () => {},
                  ),
                )
              }
            >
              Discard
            </button>
            {it.disposition !== "pending" && (
              <span className="text-ok">✓ {it.disposition}</span>
            )}
          </div>
        </Card>
      ))}
      <div className="flex gap-2">
        {!closed && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back to prompts
          </Button>
        )}
        {!closed && (
          <Button
            variant="primary"
            size="sm"
            disabled={pending}
            onClick={() => start(() => closeBrainstorm(projectId, sessionId))}
          >
            Done — close session
          </Button>
        )}
      </div>
    </div>
  );
}
