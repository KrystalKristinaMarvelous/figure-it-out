import Link from "next/link";
import { Suspense } from "react";
import { getProject, getPulse, getQuestionCounts, getActivity } from "@/lib/data";
import { shortDate, daysUntil, money, targetLabel } from "@/lib/format";
import { relativeTime } from "@/lib/utils";
import { GapPanel } from "@/components/gap-panel";
import { OneLinerEditor, StatusPicker } from "./overview-client";

export default async function Overview({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const [project, pulse, counts, activity] = await Promise.all([
    getProject(id),
    getPulse(id),
    getQuestionCounts(id),
    getActivity(id, 6),
  ]);
  const dl = daysUntil(project.deadline);

  return (
    <div className="space-y-12">
      <Suspense fallback={null}>
        <GapPanel projectId={id} />
      </Suspense>

      {/* the one-line idea */}
      <section>
        <p className="eyebrow mb-3">The idea, in one line</p>
        <OneLinerEditor
          projectId={id}
          value={project.one_liner}
          original={project.original_one_liner}
          readiness={project.readiness}
        />
        <div className="mono mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-[10.5px] uppercase tracking-[0.06em] text-faint">
          {project.target_type && (
            <span>
              Target{" "}
              <span className="text-ink-2">
                {project.target_type === "money"
                  ? money(project.target_value)
                  : project.target_value
                    ? `${project.target_value} ${targetLabel(project.target_type)}`
                    : targetLabel(project.target_type)}
              </span>
            </span>
          )}
          {project.deadline && (
            <span>
              Deadline <span className="text-ink-2">{shortDate(project.deadline)}</span>
              {dl !== null && dl >= 0 && dl <= 30 && (
                <span className="text-accent-ink"> · {dl}d left</span>
              )}
            </span>
          )}
          <span>
            Touched <span className="text-ink-2">{relativeTime(project.last_touched_at)}</span>
          </span>
        </div>
      </section>

      {/* progress */}
      <section>
        <p className="voice-lg">
          <span className="tnum text-accent-ink">{counts.resolved}</span> figured out ·{" "}
          <span className="tnum">{counts.open}</span> still open
        </p>
        <p className="mt-1.5 text-[13px] text-muted">
          {counts.exploring ? `${counts.exploring} being explored. ` : ""}
          {project.readiness !== "defined" &&
            "Questions rising is the main evidence of progress this early. "}
          <Link href={`/projects/${id}/questions`} className="link-accent">
            Open Questions →
          </Link>
        </p>
        {counts.blocking.length > 0 && (
          <ul className="open-edge mt-4 space-y-2 py-1 pl-4">
            {counts.blocking.slice(0, 3).map((q) => (
              <li key={q.id} className="voice text-[14.5px] text-ink">
                {q.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* pulse */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="eyebrow">Pulse</p>
          <span className="mono text-[10px] uppercase tracking-[0.06em] text-faint">
            Δ 7 days
          </span>
        </div>
        <div className="well hairline-x px-4">
          {pulse.map((row) => (
            <Link
              key={row.pmId}
              href={
                row.key === "open_questions"
                  ? `/projects/${id}/questions`
                  : `/projects/${id}/m/${row.pmId}`
              }
              className="-mx-4 flex items-center justify-between gap-4 px-4 py-2.5 text-[13px] transition-colors hover:bg-accent-wash/30"
            >
              <span className="text-[12.5px] text-muted">{row.label}</span>
              <span className="flex items-center gap-4">
                <span className="tnum mono text-[12px] text-ink">
                  {row.count}
                  {row.subLabel && (
                    <span className="ml-2 text-[10.5px] text-faint">{row.subLabel}</span>
                  )}
                </span>
                <span
                  className={`tnum mono w-8 text-right text-[10.5px] ${
                    row.delta > 0 ? "text-accent-ink" : "text-faint"
                  }`}
                >
                  {row.delta > 0 ? `+${row.delta}` : "—"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Status</p>
          <StatusPicker projectId={id} status={project.status} readiness={project.readiness} />
        </div>
        <div>
          <p className="eyebrow mb-3">Recent activity</p>
          <ul className="mono space-y-1.5 text-[11px] text-muted">
            {activity.length === 0 && <li className="text-faint">Nothing yet.</li>}
            {activity.map((a) => (
              <li key={a.id} className="flex items-baseline gap-2">
                <span className="flex-1 uppercase tracking-[0.04em]">
                  {a.kind.replace(/_/g, " ")}
                </span>
                <span className="text-faint">{relativeTime(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
