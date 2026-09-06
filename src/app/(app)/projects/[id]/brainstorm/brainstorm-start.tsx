"use client";

import { useState, useTransition } from "react";
import type { TopicDef } from "@/content/prompts";
import { startBrainstorm } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BrainstormStart({
  projectId,
  topics,
}: {
  projectId: string;
  topics: TopicDef[];
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t.key}
            onClick={() =>
              setPicked((s) => (s.includes(t.key) ? s.filter((x) => x !== t.key) : [...s, t.key]))
            }
            className={cn(
              "rounded-md border px-3 py-2 text-left text-sm",
              picked.includes(t.key)
                ? "border-unresolved bg-unresolved-soft"
                : "border-hairline text-muted hover:text-ink",
            )}
          >
            <span className="font-medium text-ink">{t.label}</span>
            <span className="mt-0.5 block text-xs text-muted">{t.blurb}</span>
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        disabled={pending || picked.length === 0}
        onClick={() => start(() => startBrainstorm(projectId, picked))}
      >
        {pending ? "Starting…" : "Start session"}
      </Button>
    </div>
  );
}
