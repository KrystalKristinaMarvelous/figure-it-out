import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { findCategory, findSubtype } from "@/lib/schema/taxonomy";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { ReadinessMark } from "@/components/readiness-mark";
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
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="voice-lg">Your projects</h1>
          <div className="mt-2.5 flex gap-4">
            {VIEWS.map((v) => (
              <Link
                key={v.key}
                href={`/dashboard?view=${v.key}`}
                className={`text-[12.5px] transition-colors ${
                  view === v.key
                    ? "font-medium text-ink underline decoration-accent decoration-2 underline-offset-4"
                    : "text-muted hover:text-ink"
                }`}
              >
                {v.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QuickCapture projects={projects.map((p) => ({ id: p.id, title: p.title }))} />
          <Button asChild variant="primary" size="sm">
            <Link href="/new">Start a project</Link>
          </Button>
        </div>
      </div>

      {projects.length === 0 && view === "active" ? (
        <div className="space-y-8">
          <EmptyState
            title="Figure it out first."
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
              <p className="eyebrow mb-3">Or look through an example</p>
              <div className="hairline-x framed">
                {examples.map((p) => (
                  <ProjectRow key={p.id} project={p} readOnly />
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
        <div className="hairline-x framed">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project: p, readOnly }: { project: ProjectRow; readOnly?: boolean }) {
  const cat = findCategory(p.category);
  const sub = findSubtype(p.category, p.subtype);
  const dl = daysUntil(p.deadline);

  return (
    <Link
      href={`/projects/${p.id}`}
      className="group flex items-start gap-4 py-4 transition-colors hover:bg-accent-wash/30"
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-sunken text-muted">
        <Icon name={cat?.icon ?? "Square"} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[13.5px] font-medium text-ink">{p.title}</h3>
          {!readOnly && <ReadinessMark readiness={p.readiness} className="translate-y-0.5" />}
        </div>
        <p className="voice mt-0.5 line-clamp-2 text-[13.5px] leading-snug text-muted">
          {p.one_liner || (
            <span className="text-accent-ink">No one-line idea yet — normal this early.</span>
          )}
        </p>
        <div className="mono mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] uppercase tracking-[0.05em] text-faint">
          <span>{sub?.label ?? p.subtype}</span>
          <span aria-hidden>·</span>
          {p.lifecycle === "finished" && p.finished_at ? (
            <span>finished {shortDate(p.finished_at)}</span>
          ) : (
            <span>{relativeTime(p.last_touched_at)}</span>
          )}
          {dl !== null && dl >= 0 && dl <= 30 && (
            <span className="text-accent-ink">· {dl}d left</span>
          )}
          {readOnly && <span>· example</span>}
        </div>
      </div>
      <Icon
        name="ArrowUpRight"
        size={15}
        className="mt-1 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}
