"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finishProject, shelveProject, reopenProject, addArtifact } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/field";

export function FinishFlow({
  projectId,
  title,
  originalOneLiner,
  oneLiner,
  lifecycle,
}: {
  projectId: string;
  title: string;
  originalOneLiner: string | null;
  oneLiner: string | null;
  lifecycle: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [link, setLink] = useState("");
  const [r, setR] = useState({ turned_out: "", surprised: "", differently: "", taught: "" });

  if (lifecycle === "finished") {
    return (
      <Card className="p-6">
        <h2 className="voice text-xl text-ink">This project is finished.</h2>
        <p className="mt-1 text-sm text-muted">
          It&apos;s in your Portfolio. Everything is still browsable. Revisions happen — you can
          reopen it.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => start(async () => { await reopenProject(projectId); router.push(`/projects/${projectId}`); })}
        >
          Reopen
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="voice text-2xl text-ink">Finish {title}</h2>
        <p className="text-sm text-muted">
          No requirement that tasks be closed or fields filled. People finish messy.
        </p>
      </div>

      <Card className="p-4">
        <Label>Link to the finished thing (optional)</Label>
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https:// — published site, paper, video, repo…"
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted">
          Or skip it — a trip that happened is still finished. File uploads: add them from Files &amp;
          Assets, or paste a link here.
        </p>
      </Card>

      <Card className="space-y-3 p-4">
        {originalOneLiner && (
          <p className="voice text-sm text-muted">
            Your original idea was: <span className="text-ink">“{originalOneLiner}”</span>
          </p>
        )}
        {[
          ["turned_out", "How did it actually turn out?"],
          ["surprised", "What surprised you?"],
          ["differently", "What would you do differently?"],
          ["taught", "What did this teach you for the next one?"],
        ].map(([k, q]) => (
          <div key={k}>
            <Label>{q}</Label>
            <Textarea
              className="mt-1.5"
              value={r[k as keyof typeof r]}
              onChange={(e) => setR((s) => ({ ...s, [k]: e.target.value }))}
            />
          </div>
        ))}
        <p className="text-xs text-muted">All skippable.</p>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="primary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              if (link.trim()) await addArtifact(projectId, { kind: "link", link_url: link.trim(), title });
              await finishProject(projectId, r);
              router.push("/dashboard?view=portfolio");
            })
          }
        >
          {pending ? "…" : "Mark it finished"}
        </Button>
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => start(() => shelveProject(projectId))}
        >
          Set aside instead
        </Button>
      </div>
      <p className="text-xs text-muted">
        Setting aside is not a failure — it&apos;s kept, searchable, and revivable with one tap.
      </p>
    </div>
  );
}
