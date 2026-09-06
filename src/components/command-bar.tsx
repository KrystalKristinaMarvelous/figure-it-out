"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import { Mic, Plus, Search, Sparkles, Shuffle, CircleHelp, FolderOpen } from "lucide-react";
import { createRant } from "@/lib/actions";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface ProjectLite {
  id: string;
  title: string;
}

export function CommandBar({ projects }: { projects: ProjectLite[] }) {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [capture, setCapture] = useState(false);
  const [text, setText] = useState("");
  const [captureProject, setCaptureProject] = useState<string>("");
  const [pending, start] = useTransition();

  const projectMatch = path.match(/\/projects\/([0-9a-f-]{36})/);
  const currentProjectId = projectMatch?.[1] ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      // global capture: Cmd/Ctrl + Shift + Space
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "Space") {
        e.preventDefault();
        setCaptureProject(currentProjectId ?? projects[0]?.id ?? "");
        setCapture(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentProjectId, projects]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-hairline bg-raised px-2.5 py-1 text-xs text-muted hover:text-ink sm:flex"
        aria-label="Command palette"
      >
        <Search size={12} /> <span>Search…</span>
        <kbd className="rounded bg-sunken px-1 text-[10px]">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] translate-y-0 p-0" size="md">
          <Command className="overflow-hidden" loop>
            <div className="flex items-center gap-2 border-b border-hairline px-3">
              <Search size={14} className="text-muted" />
              <Command.Input
                autoFocus
                placeholder="Jump to a project, add a question, start a brainstorm…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
                Nothing found.
              </Command.Empty>

              {currentProjectId && (
                <Command.Group heading="This project" className="text-xs text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1">
                  <Item onSelect={() => { setOpen(false); setCaptureProject(currentProjectId); setCapture(true); }} icon={<Mic size={14} />}>Rant / quick capture</Item>
                  <Item onSelect={() => go(`/projects/${currentProjectId}/questions`)} icon={<CircleHelp size={14} />}>Log an open question</Item>
                  <Item onSelect={() => go(`/projects/${currentProjectId}/brainstorm`)} icon={<Sparkles size={14} />}>Start a brainstorm</Item>
                  <Item onSelect={() => go(`/projects/${currentProjectId}/chaos`)} icon={<Shuffle size={14} />}>Open Chaos Mode</Item>
                  <Item onSelect={() => go(`/projects/${currentProjectId}/library`)} icon={<Plus size={14} />}>Add a module</Item>
                </Command.Group>
              )}

              <Command.Group heading="Go to" className="text-xs text-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1">
                <Item onSelect={() => go("/new")} icon={<Plus size={14} />}>Start a project</Item>
                <Item onSelect={() => go("/dashboard")} icon={<FolderOpen size={14} />}>Dashboard</Item>
                {projects.map((p) => (
                  <Item key={p.id} onSelect={() => go(`/projects/${p.id}`)} icon={<FolderOpen size={14} />}>
                    {p.title}
                  </Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>

      <Dialog open={capture} onOpenChange={setCapture}>
        <DialogContent size="md">
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Quick capture</h3>
              {!currentProjectId && (
                <select
                  value={captureProject}
                  onChange={(e) => setCaptureProject(e.target.value)}
                  className="rounded border border-hairline bg-raised px-2 py-1 text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Get the thought down. It files as a rant — mine it later."
              className="min-h-[8rem]"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                disabled={pending || !text.trim() || !captureProject}
                onClick={() =>
                  start(async () => {
                    await createRant(captureProject, { mode: "text", body_text: text });
                    setText("");
                    setCapture(false);
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

function Item({
  children,
  onSelect,
  icon,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-ink aria-selected:bg-raised"
    >
      <span className="text-muted">{icon}</span>
      {children}
    </Command.Item>
  );
}
