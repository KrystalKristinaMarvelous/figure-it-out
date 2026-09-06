"use client";

import { forwardRef } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-[var(--radius-sm)] border border-hairline bg-paper px-3.5 py-2 text-[14px] text-ink placeholder:text-faint shadow-[inset_0_1px_2px_rgb(80_55_30/0.04)] transition-[border-color,box-shadow] focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/12 disabled:opacity-50";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, "h-10", className)} {...props} />
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
      className={cn(base, "h-10 cursor-pointer appearance-none pr-9", className)}
      {...props}
    />
    <svg
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      width="11"
      height="11"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
      className={cn(
        "flex items-baseline gap-2 text-[12.5px] font-semibold text-ink-2",
        className,
      )}
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
        className="pressable mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border-[1.5px] border-hairline bg-paper transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <Checkbox.Indicator>
          <Check size={12} strokeWidth={3.5} className="text-white" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label && (
        <label htmlFor={id} className="cursor-pointer text-[13.5px] leading-snug text-ink">
          {label}
        </label>
      )}
    </div>
  );
}
