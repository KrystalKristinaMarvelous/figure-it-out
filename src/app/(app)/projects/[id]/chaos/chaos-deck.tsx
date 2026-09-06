"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, Check, X, Sparkles } from "lucide-react";
import { chaosKeepAsQuestion, startBrainstorm } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ChaosDeck({
  projectId,
  cards,
  roll,
}: {
  projectId: string;
  cards: { id: string; text: string }[];
  roll: number;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [done, setDone] = useState<Record<number, string>>({});
  const [pending, start] = useTransition();

  if (cards.length === 0) {
    return <p className="text-sm text-muted">No cards this time — reroll.</p>;
  }

  const card = cards[i];
  const advance = (label: string) => {
    setDone((d) => ({ ...d, [i]: label }));
    if (i < cards.length - 1) setI(i + 1);
  };

  const finished = Object.keys(done).length >= cards.length;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex gap-1">
        {cards.map((_, idx) => (
          <span
            key={idx}
            className={`h-1 flex-1 rounded-full ${
              done[idx] ? "bg-chaos" : idx === i ? "bg-chaos/40" : "bg-hairline"
            }`}
          />
        ))}
      </div>

      {!finished ? (
        <Card
          key={card.id}
          className="animate-deal border-l-2 border-l-chaos bg-chaos-wash p-7"
        >
          <p className="voice-lg text-ink">{card.text}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="chaos"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await chaosKeepAsQuestion(projectId, card.text);
                  advance("kept as question");
                })
              }
            >
              <Check size={13} /> Keep as question
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                start(() =>
                  startBrainstorm(projectId, ["getting_started"], {
                    type: "chaos",
                    text: card.text,
                  }),
                )
              }
            >
              <Sparkles size={13} /> Brainstorm this
            </Button>
            <Button variant="ghost" size="sm" onClick={() => advance("rerolled")}>
              <RefreshCw size={12} /> Reroll
            </Button>
            <Button variant="ghost" size="sm" onClick={() => advance("nothing here")}>
              <X size={13} /> Nothing here
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-sm text-ink">That&apos;s the session.</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button
              variant="chaos"
              size="sm"
              onClick={() => {
                router.push(`/projects/${projectId}/chaos?roll=${roll + 1}`);
                setI(0);
                setDone({});
              }}
            >
              <RefreshCw size={13} /> Five more
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${projectId}`)}>
              Back to project
            </Button>
          </div>
        </Card>
      )}

      <ul className="space-y-1 text-xs text-muted">
        {cards.map((c, idx) =>
          done[idx] ? (
            <li key={idx}>
              {done[idx]} — {c.text.slice(0, 60)}…
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
}
