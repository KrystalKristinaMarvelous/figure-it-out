import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { findCategory, findSubtype, READINESS_META } from "@/lib/schema/taxonomy";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { relativeTime } from "@/lib/utils";
import { shortDate, daysUntil } from "@/lib/format";
import type { ProjectRow } from "@/lib/supabase/database.types";
import { QuickCapture } from "./quick-capture";

export const metadata = { title: "Projects — FIO" };

const VIEWS = [
  { key: "active", label: "Active" },
  { key: "shelved", label: "Shelved" },
  { key: "portfolio", label: "Portfolio" },
] as const;

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  await requireUser();
  const sp = await searchParams;
  const view = (typeof sp.view === "string" ? sp.view : "active") as
    | "active"
    | "shelved"
    | "portfolio";
  const supabase = await createClient();

  const lifecycle =
    view === "portfolio" ? "finished" : view === "shelved" ? "shelved" : "active";
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
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-[var(--radius-sm)] border border-hairline-2 bg-raised p-0.5">
          {VIEWS.map((v) => (
            <Link
              key={v.key}
              href={`/dashboard?view=${v.key}`}
              className={`rounded-[calc(var(--radius-sm)-1px)] px-3 py-1.5 text-[12.5px] transition-colors ${
                view === v.key
                  ? "bg-surface font-medium text-ink shadow-[var(--shadow-sm)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <QuickCapture projects={projects.map((p) => ({ id: p.id, title: p.title }))} />
          <Button asChild variant="primary" size="sm">
            <Link href="/new">Start a project</Link>
          </Button>
        </div>
      </div>

      {projects.length === 0 && view === "active" ? (
        <div className="space-y-6">
          <EmptyState
            title="Start a project"
            actions={
              <Button asChild variant="primary" size="sm">
                <Link href="/new">Start a project</Link>
              </Button>
            }
          >
            You know you want to make something — a novel, a campaign, a trip, a thesis. You
            don&apos;t have to know what it is yet. That&apos;s exactly what this is for.
          </EmptyState>
          {examples.length > 0 && (
            <div>
              <p className="mb-3 text-[12px] text-faint">Or look through an example:</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {examples.map((p) => (
                  <ProjectCard key={p.id} project={p} readOnly />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : projects.length === 0 ? (
        <p className="voice py-16 text-center text-[15px] text-muted">
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
    <Link href={`/projects/${p.id}`} className="group">
      <Card
        interactive
        tint={!p.one_liner && p.lifecycle === "active" ? "unresolved" : "default"}
        className="flex h-full flex-col gap-2.5 p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-[15px] leading-none">{cat?.glyph}</span>
          <span title={rm.label} className="text-[13px]">
            {rm.glyph}
          </span>
        </div>
        <h3 className="text-[13.5px] font-semibold leading-snug text-ink group-hover:text-ink">
          {p.title}
        </h3>
        <p className="voice line-clamp-3 text-[13.5px] leading-snug text-muted">
          {p.one_liner || (
            <span className="text-unresolved-ink">
              No one-line idea yet — normal this early.
            </span>
          )}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2 text-[11px] text-faint">
          <span>{sub?.label ?? p.subtype}</span>
          <span aria-hidden>·</span>
          {p.lifecycle === "finished" && p.finished_at ? (
            <span>finished {shortDate(p.finished_at)}</span>
          ) : (
            <span>{relativeTime(p.last_touched_at)}</span>
          )}
          {dl !== null && dl >= 0 && dl <= 30 && (
            <span className="text-unresolved">· {dl}d left</span>
          )}
          {readOnly && (
            <span className="rounded-full bg-sunken px-1.5 py-0.5 text-faint">example</span>
          )}
        </div>
      </Card>
    </Link>
  );
}
