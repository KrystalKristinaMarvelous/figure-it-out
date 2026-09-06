"use client";

import { forwardRef } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-[var(--radius-sm)] border border-hairline bg-paper px-3 py-2 text-[13.5px] text-ink placeholder:text-faint transition-colors focus:border-accent focus:outline-none disabled:opacity-50";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, "h-9", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, "min-h-[5rem] resize-y leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(base, "h-9 cursor-pointer appearance-none pr-9", className)}
      {...props}
    />
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label
      className={cn("flex items-baseline gap-2 text-[12px] font-medium text-ink-2", className)}
      {...props}
    >
      {children}
      {hint && <span className="font-normal text-faint">{hint}</span>}
    </label>
  );
}

/** The app's voice — the line under a field, or a standalone prompt. */
export function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="voice measure text-[14px] text-muted">{children}</p>;
}

export function CheckboxField({
  checked,
  onCheckedChange,
  label,
  id,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="pressable mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-hairline bg-paper transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Checkbox.Indicator>
          <Check size={11} strokeWidth={3} className="text-[#fdf6f0]" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label && (
        <label htmlFor={id} className="cursor-pointer text-[13px] leading-snug text-ink">
          {label}
        </label>
      )}
    </div>
  );
}
