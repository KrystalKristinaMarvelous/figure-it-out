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
        <div key={g.key} className="open-edge flex items-start gap-3 py-2.5 pl-3.5">
          <div className="flex-1">
            <p className="voice text-[14px] text-ink">{g.message}</p>
            {g.action && (
              <Link
                href={g.action.href}
                className="link-accent mt-0.5 inline-block text-[11.5px]"
              >
                {g.action.label} →
              </Link>
            )}
          </div>
          <DismissGap projectId={projectId} gapKey={g.key} />
        </div>
      ))}
      {contradictions.slice(0, 2).map((c, i) => (
        <div key={i} className="border-l-2 border-denim py-2.5 pl-3.5 text-[13px] text-ink">
          <span className="mono text-[10.5px] uppercase tracking-[0.06em] text-denim">Check </span>
          {c.message}
        </div>
      ))}
    </div>
  );
}
