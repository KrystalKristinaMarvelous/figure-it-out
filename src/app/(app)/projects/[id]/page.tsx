import Link from "next/link";
import { getProject, getPulse, getQuestionCounts, getActivity } from "@/lib/data";
import { findSubtype } from "@/lib/schema/taxonomy";
import { shortDate, daysUntil, money, targetLabel } from "@/lib/format";
import { relativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { OneLinerEditor, StatusPicker } from "./overview-client";

export default async function Overview({ params }: PageProps<"/projects/[id]"> ) {
  const { id } = await params;
  const [project, pulse, counts, activity] = await Promise.all([
    getProject(id),
    getPulse(id),
    getQuestionCounts(id),
    getActivity(id, 8),
  ]);
  const sub = findSubtype(project.category, project.subtype);
  const dl = daysUntil(project.deadline);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-6">
        <Card className="p-5" tint={project.one_liner ? "default" : "unresolved"}>
          <OneLinerEditor
            projectId={id}
            value={project.one_liner}
            original={project.original_one_liner}
            readiness={project.readiness}
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
            {project.target_type && (
              <span>
                Target{" "}
                <span className="text-ink">
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
                Deadline <span className="text-ink">{shortDate(project.deadline)}</span>
                {dl !== null && dl >= 0 && dl <= 30 && (
                  <span className="text-unresolved"> · {dl}d</span>
                )}
              </span>
            )}
            <span>
              Touched <span className="text-ink">{relativeTime(project.last_touched_at)}</span>
            </span>
          </div>
        </Card>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Pulse</h2>
            <span className="text-xs text-muted">last 7 days</span>
          </div>
          <Card className="divide-y divide-hairline">
            {pulse.map((row) => (
              <Link
                key={row.pmId}
                href={
                  row.key === "open_questions"
                    ? `/projects/${id}/questions`
                    : `/projects/${id}/m/${row.pmId}`
                }
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-raised"
              >
                <span className="text-xs font-medium tracking-wide text-muted">{row.label}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-ink">
                    {row.count}
                    {row.subLabel && <span className="ml-2 text-xs text-muted">{row.subLabel}</span>}
                  </span>
                  <span className="w-14 text-right text-xs tabular-nums text-muted">
                    {row.delta > 0 ? `+${row.delta}` : "—"}
                  </span>
                </span>
              </Link>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">
            You&apos;ve figured out {counts.resolved} {counts.resolved === 1 ? "thing" : "things"}
          </h2>
          <p className="text-sm text-muted">
            {counts.open} still open{counts.exploring ? `, ${counts.exploring} being explored` : ""}.{" "}
            <Link href={`/projects/${id}/questions`} className="text-unresolved underline">
              Open Questions →
            </Link>
          </p>
          {counts.blocking.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {counts.blocking.slice(0, 3).map((q) => (
                <li key={q.id} className="text-sm text-ink">
                  <span className="text-unresolved">🔴</span> {q.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-5">
        <Card className="p-4">
          <h3 className="mb-2 text-xs font-semibold text-muted">Status</h3>
          <StatusPicker projectId={id} status={project.status} readiness={project.readiness} />
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-xs font-semibold text-muted">Recent activity</h3>
          <ul className="space-y-1.5 text-xs text-muted">
            {activity.length === 0 && <li>Nothing yet.</li>}
            {activity.map((a) => (
              <li key={a.id}>
                {a.kind.replace(/_/g, " ")} · {relativeTime(a.created_at)}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-1 text-xs font-semibold text-muted">Finish or set aside</h3>
          <div className="flex flex-col gap-1 text-sm">
            <Link href={`/projects/${id}/finish`} className="text-unresolved hover:underline">
              Mark it finished →
            </Link>
          </div>
        </Card>
      </aside>
    </div>
  );
}
