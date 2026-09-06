import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Cards differ by border weight and background tint, not drop shadows (spec §18.4). */
export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tint?: "default" | "paper" | "sunken" | "unresolved" | "chaos";
    interactive?: boolean;
  }
>(({ className, tint = "default", interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card",
      tint === "paper" && "bg-paper",
      tint === "sunken" && "border-hairline-2 bg-sunken",
      tint === "unresolved" && "unresolved-edge rounded-l-[2px]",
      tint === "chaos" && "border-l-2 border-l-chaos bg-chaos-wash rounded-l-[2px]",
      interactive && "card-hover card-link",
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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[-0.01em]",
        tone === "neutral" && "bg-sunken text-muted",
        tone === "unresolved" && "bg-unresolved-wash text-unresolved-ink",
        tone === "chaos" && "bg-chaos-wash text-chaos",
        tone === "ok" && "bg-ok/12 text-ok",
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
    <div className="rounded-[var(--radius-lg)] border border-dashed border-hairline bg-raised/40 p-7">
      <h3 className="screen-title">{title}</h3>
      <p className="voice measure mt-1.5 text-[14px] text-muted">{children}</p>
      {example && (
        <figure className="mt-4 rounded-[var(--radius)] border border-hairline-2 bg-paper/70 p-3.5 text-[13px] text-muted">
          <figcaption className="eyebrow mb-1.5">For example</figcaption>
          {example}
        </figure>
      )}
      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  children,
  hint,
  action,
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-2.5">
        <h2 className="screen-title">{children}</h2>
        {hint && <span className="text-[11.5px] text-faint">{hint}</span>}
      </div>
      {action}
    </div>
  );
}
