"use client";

import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
  className,
  children,
  size = "md",
  ...props
}: React.ComponentProps<typeof D.Content> & { size?: "sm" | "md" | "lg" | "full" }) {
  return (
    <D.Portal>
      <D.Overlay className="animate-overlay fixed inset-0 z-50 bg-ink/25 backdrop-blur-[3px]" />
      <D.Content
        className={cn(
          "animate-pop fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface shadow-[var(--shadow-pop)] focus:outline-none",
          size === "sm" && "w-[92vw] max-w-sm",
          size === "md" && "w-[92vw] max-w-lg",
          size === "lg" && "w-[94vw] max-w-2xl",
          size === "full" && "h-[92vh] w-[94vw] max-w-5xl",
          className,
        )}
        {...props}
      >
        {children}
        <D.Close
          className="pressable absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-muted hover:bg-raised hover:text-ink"
          aria-label="Close"
        >
          <X size={15} />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}

export function DialogHeader({
  title,
  description,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="border-b border-hairline-2 px-5 pb-3.5 pt-4">
      <D.Title className="screen-title">{title}</D.Title>
      {description && (
        <D.Description className="voice mt-1 measure text-[13.5px] text-muted">
          {description}
        </D.Description>
      )}
    </div>
  );
}

export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-hairline-2 bg-raised/40 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
