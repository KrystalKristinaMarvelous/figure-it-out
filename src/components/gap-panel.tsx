import Link from "next/link";
import { getGapContext } from "@/lib/data";
import { detectGaps, detectContradictions } from "@/lib/gaps";
import { DismissGap } from "./gap-panel-client";

/**
 * Tier 1 findings (spec §13). Questions, never assertions. Max three shown.
 * Never blocks, never badges.
 */
export async function GapPanel({
  projectId,
  moduleKey,
  max = 3,
}: {
  projectId: string;
  moduleKey?: string;
  max?: number;
}) {
  const ctx = await getGapContext(projectId);
  const gaps = detectGaps(
    projectId,
    ctx.modules,
    ctx.entriesByPm,
    ctx.questions,
    ctx.dismissed,
  ).filter((g) => !moduleKey || g.moduleKey === moduleKey);

  const contradictions = moduleKey
    ? []
    : detectContradictions(ctx.modules, ctx.entriesByPm, {
        target_type: ctx.project.target_type,
        target_value: ctx.project.target_value,
      });

  if (gaps.length === 0 && contradictions.length === 0) return null;

  return (
    <div className="space-y-2">
      {gaps.slice(0, max).map((g) => (
        <div
          key={g.key}
          className="flex items-start gap-2 rounded-md border border-unresolved/30 bg-unresolved-soft px-3 py-2 text-sm"
        >
          <span className="text-unresolved">⚡</span>
          <div className="flex-1">
            <p className="voice text-ink">{g.message}</p>
            {g.action && (
              <Link href={g.action.href} className="text-xs text-unresolved underline">
                {g.action.label}
              </Link>
            )}
          </div>
          <DismissGap projectId={projectId} gapKey={g.key} />
        </div>
      ))}
      {contradictions.slice(0, 2).map((c, i) => (
        <div
          key={i}
          className="rounded-md border border-hairline bg-raised px-3 py-2 text-sm text-ink"
        >
          <span className="text-muted">Check: </span>
          {c.message}
        </div>
      ))}
    </div>
  );
}
