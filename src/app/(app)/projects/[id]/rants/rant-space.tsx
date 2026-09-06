"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Mic, Square, Send, Search } from "lucide-react";
import type { RantRow } from "@/lib/supabase/database.types";
import type { FieldDef } from "@/lib/schema/types";
import { createClient } from "@/lib/supabase/client";
import { createRant, createEntry } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea, Input } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { relativeTime } from "@/lib/utils";

interface Target {
  pmId: string;
  key: string;
  name: string;
  schema: FieldDef[];
}

export function RantSpace({
  projectId,
  rants,
  targets,
}: {
  projectId: string;
  rants: RantRow[];
  targets: Target[];
}) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [triage, setTriage] = useState<{ rant: RantRow; text: string } | null>(null);

  const filtered = query.trim()
    ? rants.filter((r) =>
        `${r.body_text ?? ""} ${r.transcript ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      )
    : rants;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <Card className="p-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type freely. No title, no tags. Autosaves when you send."
            className="min-h-[7rem] border-0 bg-transparent px-1 focus:border-0"
          />
          <div className="flex items-center justify-between">
            <AudioRecorder projectId={projectId} />
            <Button
              variant="primary"
              size="sm"
              disabled={pending || !text.trim()}
              onClick={() =>
                start(async () => {
                  await createRant(projectId, { mode: "text", body_text: text });
                  setText("");
                })
              }
            >
              <Send size={13} /> Send
            </Button>
          </div>
        </Card>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rants and transcripts"
            className="pl-8"
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">
              {rants.length ? "No rants match." : "Nothing yet. The archive only pays off if it gets read again — so start filling it."}
            </p>
          )}
          {filtered.map((r) => (
            <RantCard key={r.id} rant={r} onTriage={(t) => setTriage({ rant: r, text: t })} />
          ))}
        </div>
      </div>

      <aside>
        <Card className="p-4">
          <Heatmap rants={rants} />
        </Card>
        <Resurface rants={rants} />
      </aside>

      <TriageDialog
        open={!!triage}
        onClose={() => setTriage(null)}
        projectId={projectId}
        targets={targets}
        seed={triage}
      />
    </div>
  );
}

function RantCard({ rant, onTriage }: { rant: RantRow; onTriage: (text: string) => void }) {
  const [sel, setSel] = useState("");
  const body = rant.body_text ?? rant.transcript ?? "";
  return (
    <Card className="p-3">
      {rant.mode === "audio" && rant.audio_url && (
        <audio controls src={rant.audio_url} className="mb-2 w-full" />
      )}
      <p
        className="whitespace-pre-wrap text-sm leading-relaxed text-ink"
        onMouseUp={() => setSel(window.getSelection()?.toString() ?? "")}
      >
        {body || <span className="text-muted italic">
          {rant.transcript_status === "queued" || rant.transcript_status === "processing"
            ? "Transcribing…"
            : rant.transcript_status === "failed"
              ? "Transcription unavailable — the audio is kept."
              : "(no text)"}
        </span>}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>{relativeTime(rant.created_at)}</span>
        {rant.mined && <span className="rounded bg-sunken px-1.5 py-0.5">mined</span>}
        {body && (
          <button
            className="ml-auto rounded bg-ink px-2 py-0.5 text-surface"
            onClick={() => onTriage(sel && body.includes(sel) ? sel : body)}
          >
            Send to…
          </button>
        )}
      </div>
    </Card>
  );
}

function AudioRecorder({ projectId }: { projectId: string }) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const chunks = useRef<Blob[]>([]);
  const recRef = useRef<MediaRecorder | null>(null);
  const startedAt = useRef(0);

  async function toggle() {
    if (recording) {
      recRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      startedAt.current = Date.now();
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const duration = Date.now() - startedAt.current;
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          const path = `${user!.id}/${projectId}/${Date.now()}.webm`;
          const { error } = await supabase.storage.from("audio").upload(path, blob);
          if (error) throw error;
          const { data: signed } = await supabase.storage
            .from("audio")
            .createSignedUrl(path, 60 * 60 * 24 * 365);
          const rantId = await createRant(projectId, {
            mode: "audio",
            audio_url: signed?.signedUrl,
            duration_ms: duration,
          });
          if (rantId) {
            fetch("/api/transcribe", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ rantId, path, projectId }),
            }).catch(() => {});
          }
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      rec.addEventListener("stop", () => setRecording(false));
    } catch {
      alert("Microphone access is needed to record.");
    }
  }

  return (
    <Button variant={recording ? "unresolved" : "outline"} size="sm" onClick={toggle} disabled={busy}>
      {recording ? <Square size={13} /> : <Mic size={13} />}
      {busy ? "Saving…" : recording ? "Stop" : "Record"}
    </Button>
  );
}

function TriageDialog({
  open,
  onClose,
  projectId,
  targets,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  targets: Target[];
  seed: { rant: RantRow; text: string } | null;
}) {
  const [pmId, setPmId] = useState("");
  const [pending, start] = useTransition();
  const target = targets.find((t) => t.pmId === pmId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader
          title="Send to a module"
          description="Creates an entry seeded with this text, with a link back to the rant. The rant is unchanged."
        />
        <DialogBody>
          <blockquote className="mb-3 border-l-2 border-hairline pl-3 text-sm text-muted">
            {seed?.text.slice(0, 300)}
          </blockquote>
          <select
            value={pmId}
            onChange={(e) => setPmId(e.target.value)}
            className="w-full rounded-md border border-hairline bg-raised px-2 py-2 text-sm"
          >
            <option value="">Choose a module…</option>
            {targets.map((t) => (
              <option key={t.pmId} value={t.pmId}>
                {t.name}
              </option>
            ))}
          </select>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={pending || !target || !seed}
            onClick={() =>
              start(async () => {
                if (!target || !seed) return;
                const titleField = target.schema.find((f) => f.isTitle) ?? target.schema[0];
                const longField = target.schema.find((f) => f.type === "longtext");
                const raw: Record<string, unknown> = {};
                if (longField) raw[longField.key] = seed.text;
                else if (titleField) raw[titleField.key] = seed.text.slice(0, 120);
                if (titleField && titleField !== longField)
                  raw[titleField.key] = seed.text.slice(0, 80);
                await createEntry(projectId, target.pmId, raw, {
                  derivedFromRantId: seed.rant.id,
                });
                onClose();
              })
            }
          >
            Create entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Heatmap({ rants }: { rants: RantRow[] }) {
  const days: Record<string, number> = {};
  rants.forEach((r) => {
    const d = r.created_at.slice(0, 10);
    days[d] = (days[d] ?? 0) + 1;
  });
  const cells = Array.from({ length: 49 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (48 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, n: days[key] ?? 0 };
  });
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold text-muted">Last 7 weeks</h3>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key}: ${c.n}`}
            className="h-3 w-3 rounded-[2px]"
            style={{
              background:
                c.n === 0
                  ? "var(--hairline)"
                  : `color-mix(in srgb, var(--unresolved) ${Math.min(100, 30 + c.n * 25)}%, var(--surface))`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Resurface({ rants }: { rants: RantRow[] }) {
  const [pick, setPick] = useState<RantRow | null>(null);
  useEffect(() => {
    if (rants.length) setPick(rants[Math.floor(Math.random() * rants.length)]);
  }, [rants]);
  if (!pick) return null;
  return (
    <Card className="mt-4 p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted">From the archive</h3>
        <button
          className="text-xs text-unresolved"
          onClick={() => setPick(rants[Math.floor(Math.random() * rants.length)])}
        >
          another
        </button>
      </div>
      <p className="line-clamp-4 text-sm text-ink">{pick.body_text ?? pick.transcript}</p>
      <p className="mt-1 text-xs text-muted">{relativeTime(pick.created_at)}</p>
    </Card>
  );
}
