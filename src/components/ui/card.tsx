import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Cards differ by border weight and background tint, not drop shadows (spec §18.4). */
export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { tint?: "default" | "raised" | "unresolved" }
>(({ className, tint = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border",
      tint === "default" && "border-hairline bg-raised",
      tint === "raised" && "border-hairline bg-surface",
      tint === "unresolved" && "border-unresolved/40 bg-unresolved-soft",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "unresolved" | "chaos" | "ok" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-sunken text-muted",
        tone === "unresolved" && "bg-unresolved-soft text-unresolved",
        tone === "chaos" && "bg-chaos-soft text-chaos",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "outline" && "border border-hairline text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  children,
  example,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  example?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-hairline bg-raised/50 p-6">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="voice mt-1 text-[15px] text-muted measure">{children}</p>
      {example && (
        <div className="mt-4 rounded-md border border-hairline bg-surface/60 p-3 text-sm text-muted">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted/70">
            For example
          </span>
          {example}
        </div>
      )}
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-sm font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}
