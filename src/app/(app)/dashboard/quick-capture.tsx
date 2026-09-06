"use client";

import { useState, useTransition } from "react";
import { Mic } from "lucide-react";
import { createRant } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/field";

export function QuickCapture({ projects }: { projects: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [target, setTarget] = useState(projects[0]?.id ?? "");
  const [pending, start] = useTransition();

  if (projects.length === 0) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Mic size={13} /> Quick capture
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Quick capture</h3>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="rounded border border-hairline bg-raised px-2 py-1 text-xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Files as a rant into that project. Mine it later."
              className="min-h-[7rem]"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                disabled={pending || !text.trim()}
                onClick={() =>
                  start(async () => {
                    await createRant(target, { mode: "text", body_text: text });
                    setText("");
                    setOpen(false);
                  })
                }
              >
                Capture
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
