import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Content sits in a recessed "well" or directly on the page — never a floating
 * rounded card. `tint` shifts the treatment for special states.
 */
export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tint?: "default" | "paper" | "well" | "unresolved" | "chaos" | "flat";
    interactive?: boolean;
  }
>(({ className, tint = "default", interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      tint === "flat"
        ? "rounded-[var(--radius)] border border-hairline-2 bg-transparent"
        : "well",
      tint === "paper" && "bg-paper shadow-none border border-hairline-2",
      tint === "unresolved" && "open-edge !rounded-l-[2px] bg-transparent shadow-none",
      tint === "chaos" && "border-l-2 border-l-chaos bg-chaos-wash shadow-none !rounded-l-[2px]",
      interactive &&
        "cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--sunken)_60%,var(--raised))]",
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
        "mono inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[10.5px] uppercase tracking-[0.06em]",
        tone === "neutral" && "bg-sunken text-muted",
        tone === "unresolved" && "bg-accent-wash text-accent-ink",
        tone === "chaos" && "bg-chaos-wash text-chaos",
        tone === "ok" && "bg-brass/12 text-brass",
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
    <div className="well px-7 py-8 sm:px-9 sm:py-10">
      <h3 className="voice-lg">{title}</h3>
      <p className="voice measure mt-2 text-[15px] text-muted">{children}</p>
      {example && (
        <div className="mt-5 max-w-md border-l-2 border-hairline pl-4 text-[13px] text-muted">
          <span className="eyebrow mb-1 block">For example</span>
          {example}
        </div>
      )}
      {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
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
