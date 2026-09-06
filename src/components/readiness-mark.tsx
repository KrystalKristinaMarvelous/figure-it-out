import { cn } from "@/lib/utils";
import type { Readiness } from "@/lib/schema/types";

const LEVEL: Record<Readiness, number> = { seed: 1, vague: 2, defined: 3 };

/** Three ascending segments — a quiet stand-in for the readiness glyph. */
export function ReadinessMark({
  readiness,
  className,
}: {
  readiness: Readiness;
  className?: string;
}) {
  const filled = LEVEL[readiness] ?? 1;
  return (
    <span className={cn("inline-flex items-end gap-[2px]", className)} aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn(
            "w-[3px] rounded-[1px]",
            n === 1 && "h-[5px]",
            n === 2 && "h-[8px]",
            n === 3 && "h-[11px]",
            n <= filled ? "bg-accent" : "bg-hairline",
          )}
        />
      ))}
    </span>
  );
}

export const READINESS_WORD: Record<Readiness, string> = {
  seed: "just an itch",
  vague: "taking shape",
  defined: "know what it is",
};
