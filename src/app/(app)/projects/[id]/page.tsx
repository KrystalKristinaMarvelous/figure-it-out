import Link from "next/link";
import { Suspense } from "react";
import { getProject, getPulse, getQuestionCounts, getActivity } from "@/lib/data";
import { shortDate, daysUntil, money, targetLabel } from "@/lib/format";
import { relativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
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
    <div className="space-y-8">
      <Suspense fallback={null}>
        <GapPanel projectId={id} />
      </Suspense>

      {/* the one-line idea — the most important field on the screen */}
      <section>
        <p className="eyebrow mb-2">The idea, in one line</p>
        <OneLinerEditor
          projectId={id}
          value={project.one_liner}
          original={project.original_one_liner}
          readiness={project.readiness}
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-muted">
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
                <span className="text-unresolved"> · {dl}d left</span>
              )}
            </span>
          )}
          <span>
            Last touched <span className="text-ink-2">{relativeTime(project.last_touched_at)}</span>
          </span>
        </div>
      </section>

      {/* progress — questions figured out */}
      <section>
        <h2 className="voice-lg">
          You&apos;ve figured out{" "}
          <span className="tnum text-ink">{counts.resolved}</span>{" "}
          {counts.resolved === 1 ? "thing" : "things"} about this project.
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          <span className="tnum">{counts.open}</span> still open
          {counts.exploring ? `, ${counts.exploring} being explored` : ""}.{" "}
          {project.readiness !== "defined" && "That's the main evidence of progress this early. "}
          <Link
            href={`/projects/${id}/questions`}
            className="font-medium text-unresolved hover:underline"
          >
            Open Questions →
          </Link>
        </p>
        {counts.blocking.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-l-2 border-unresolved pl-3">
            {counts.blocking.slice(0, 3).map((q) => (
              <li key={q.id} className="voice text-[14px] text-ink">
                {q.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* pulse */}
      <section>
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="screen-title">Pulse</h2>
          <span className="text-[11.5px] text-faint">Δ last 7 days</span>
        </div>
        <Card className="hairline-x overflow-hidden">
          {pulse.map((row) => (
            <Link
              key={row.pmId}
              href={
                row.key === "open_questions"
                  ? `/projects/${id}/questions`
                  : `/projects/${id}/m/${row.pmId}`
              }
              className="flex items-center justify-between gap-4 px-4 py-2.5 text-[13px] transition-colors hover:bg-raised"
            >
              <span className="text-[12px] font-medium text-muted">{row.label}</span>
              <span className="flex items-center gap-4">
                <span className="tnum text-ink">
                  {row.count}
                  {row.subLabel && (
                    <span className="ml-2 text-[11.5px] text-faint">{row.subLabel}</span>
                  )}
                </span>
                <span
                  className={`tnum w-10 text-right text-[11.5px] ${
                    row.delta > 0 ? "text-ink-2" : "text-faint"
                  }`}
                >
                  {row.delta > 0 ? `+${row.delta}` : "—"}
                </span>
              </span>
            </Link>
          ))}
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4" tint="paper">
          <p className="eyebrow mb-2.5">Status</p>
          <StatusPicker projectId={id} status={project.status} readiness={project.readiness} />
        </Card>
        <Card className="p-4" tint="paper">
          <p className="eyebrow mb-2.5">Recent activity</p>
          <ul className="space-y-1.5 text-[12px] text-muted">
            {activity.length === 0 && <li className="text-faint">Nothing yet.</li>}
            {activity.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <Icon name="Dot" size={14} className="shrink-0 text-faint" />
                <span className="flex-1 capitalize">{a.kind.replace(/_/g, " ")}</span>
                <span className="text-faint">{relativeTime(a.created_at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
