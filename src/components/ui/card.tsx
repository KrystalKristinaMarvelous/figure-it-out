import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tint?: "default" | "paper" | "sunken" | "unresolved" | "chaos" | "note";
    interactive?: boolean;
  }
>(({ className, tint = "default", interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      tint === "note" ? "note" : "card",
      tint === "paper" && "bg-paper",
      tint === "sunken" && "border-hairline-2 bg-sunken shadow-none",
      tint === "unresolved" && "open-edge",
      tint === "chaos" && "border-l-[3px] border-l-chaos bg-chaos-wash",
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        tone === "neutral" && "bg-sunken text-muted",
        tone === "unresolved" && "bg-accent-wash text-accent-ink",
        tone === "chaos" && "bg-chaos-wash text-chaos",
        tone === "ok" && "bg-sage-wash text-sage",
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
    <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-hairline bg-raised/50 p-7 sm:p-9">
      <h3 className="voice-lg">{title}</h3>
      <p className="voice measure mt-2 text-[14.5px] text-muted">{children}</p>
      {example && (
        <figure className="note mt-5 max-w-md -rotate-1 p-4 text-[13px] text-ink/80">
          <figcaption className="eyebrow mb-1.5 text-ink/40">For example</figcaption>
          {example}
        </figure>
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
