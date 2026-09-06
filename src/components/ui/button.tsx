import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "pressable inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border font-medium tracking-[-0.01em] whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-45 select-none focus-visible:outline-offset-1",
  {
    variants: {
      variant: {
        primary: "border-ink bg-ink text-surface hover:bg-ink-2 hover:border-ink-2",
        outline: "border-hairline bg-paper text-ink shadow-[var(--shadow-sm)] hover:border-muted hover:bg-raised",
        ghost: "border-transparent bg-transparent text-muted hover:text-ink hover:bg-raised",
        unresolved: "border-unresolved bg-unresolved text-white hover:brightness-[1.08]",
        chaos: "border-chaos bg-chaos text-white hover:brightness-110",
        danger: "border-transparent bg-transparent text-unresolved hover:bg-unresolved-wash",
      },
      size: {
        xs: "h-6 px-2 text-[11px]",
        sm: "h-8 px-3 text-[12.5px]",
        md: "h-9 px-4 text-[13px]",
        lg: "h-11 px-6 text-[14px]",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { button as buttonVariants };
