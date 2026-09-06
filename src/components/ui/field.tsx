"use client";

import { forwardRef } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-hairline bg-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-unresolved focus:outline-none transition-colors";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, className)} {...props} />
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
  <select ref={ref} className={cn(base, "appearance-none pr-8", className)} {...props} />
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
      className={cn("block text-[13px] font-medium text-muted", className)}
      {...props}
    >
      {children}
      {hint && <span className="ml-2 font-normal text-muted/80">{hint}</span>}
    </label>
  );
}

/** The app's voice — used above every schema field and in prompts. */
export function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="voice text-[15px] text-ink/85 measure">{children}</p>
  );
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
    <div className="flex items-center gap-2">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="grid h-4 w-4 place-items-center rounded-[3px] border border-hairline bg-raised data-[state=checked]:border-ink data-[state=checked]:bg-ink"
      >
        <Checkbox.Indicator>
          <Check size={11} className="text-surface" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label && (
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
      )}
    </div>
  );
}
