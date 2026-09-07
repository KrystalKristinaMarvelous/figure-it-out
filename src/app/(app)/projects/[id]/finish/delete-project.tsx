"use client";

import { useState, useTransition } from "react";
import { deleteProject } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

export function DeleteProject({ projectId, title }: { projectId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const matches = typed === title;

  return (
    <div className="mt-14 border-t border-hairline-2 pt-6">
      <p className="eyebrow mb-1 text-accent-ink">Danger</p>
      <p className="voice text-[13.5px] text-muted">
        Delete this project and everything in it — entries, questions, rants, the lot. This
        cannot be undone.
      </p>
      <Button
        variant="danger"
        size="sm"
        className="mt-3"
        onClick={() => {
          setTyped("");
          setError(null);
          setOpen(true);
        }}
      >
        Delete project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader
            title="Delete this project"
            description="Everything in it goes with it, permanently. There is no undo and no trash."
          />
          <DialogBody>
            <p className="mb-2 text-[13px] text-ink">
              Type <span className="mono rounded bg-sunken px-1 py-0.5 text-accent-ink">{title}</span>{" "}
              exactly to confirm.
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder={title}
            />
            {error && <p className="mt-2 text-[13px] text-accent-ink">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!matches || pending}
              onClick={() =>
                start(async () => {
                  try {
                    await deleteProject(projectId, typed);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Could not delete");
                  }
                })
              }
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
