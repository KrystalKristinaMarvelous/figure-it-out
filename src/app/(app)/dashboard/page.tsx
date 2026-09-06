import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { findCategory, findSubtype, READINESS_META } from "@/lib/schema/taxonomy";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { QuickCapture } from "./quick-capture";
import { relativeTime } from "@/lib/utils";
import { shortDate, daysUntil } from "@/lib/format";
import type { ProjectRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Projects — FIO" };

const VIEWS = [
  { key: "active", label: "Active" },
  { key: "shelved", label: "Shelved" },
  { key: "portfolio", label: "Portfolio" },
] as const;

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  await requireUser();
  const sp = await searchParams;
  const view = (typeof sp.view === "string" ? sp.view : "active") as "active" | "shelved" | "portfolio";
  const supabase = await createClient();

  const lifecycle = view === "portfolio" ? "finished" : view === "shelved" ? "shelved" : "active";
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("lifecycle", lifecycle)
    .eq("is_example", false)
    .order(view === "portfolio" ? "finished_at" : "last_touched_at", { ascending: false });
  const projects = (data ?? []) as ProjectRow[];

  const { data: examplesData } =
    view === "active" && projects.length === 0
      ? await supabase.from("projects").select("*").eq("is_example", true).limit(3)
      : { data: [] };
  const examples = (examplesData ?? []) as ProjectRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={`/dashboard?view=${v.key}`}
              className={`rounded-md px-3 py-1.5 text-sm ${
                view === v.key ? "bg-raised font-medium text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <QuickCapture
            projects={projects.map((p) => ({ id: p.id, title: p.title }))}
          />
          <Button asChild variant="primary" size="sm">
            <Link href="/new">Start a project</Link>
          </Button>
        </div>
      </div>

      {projects.length === 0 && view === "active" ? (
        <div className="space-y-4">
          <EmptyState
            title="Start a project"
            actions={
              <Button asChild variant="primary" size="sm">
                <Link href="/new">Start a project</Link>
              </Button>
            }
          >
            You know you want to make something — a novel, a campaign, a trip, a thesis. You don&apos;t
            have to know what it is yet. That&apos;s what this is for.
          </EmptyState>
          {examples.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted">Or look through an example:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {examples.map((p) => (
                  <ProjectCard key={p.id} project={p} readOnly />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : projects.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Nothing {view === "shelved" ? "set aside" : "finished"} yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project: p, readOnly }: { project: ProjectRow; readOnly?: boolean }) {
  const cat = findCategory(p.category);
  const sub = findSubtype(p.category, p.subtype);
  const rm = READINESS_META[p.readiness];
  const dl = daysUntil(p.deadline);

  return (
    <Card
      className="flex flex-col gap-2 p-4 transition-colors hover:border-muted"
      tint={!p.one_liner ? "unresolved" : "default"}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${p.id}`} className="text-sm font-semibold text-ink hover:underline">
          {p.title}
        </Link>
        <span title={rm.label} className="shrink-0 text-sm">
          {rm.glyph}
        </span>
      </div>
      <p className="voice text-sm text-muted">
        {p.one_liner || (
          <span className="text-unresolved">No one-line idea yet — that&apos;s normal this early.</span>
        )}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted">
        <span>
          {cat?.label} → {sub?.label ?? p.subtype}
        </span>
        {p.lifecycle === "finished" && p.finished_at ? (
          <span>finished {shortDate(p.finished_at)}</span>
        ) : (
          <span>· {relativeTime(p.last_touched_at)}</span>
        )}
        {dl !== null && dl >= 0 && dl <= 30 && <span className="text-unresolved">{dl}d left</span>}
        {readOnly && <span className="rounded bg-sunken px-1.5 py-0.5">example</span>}
      </div>
    </Card>
  );
}
