import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "border-ink bg-ink text-surface hover:opacity-90",
        outline:
          "border-hairline bg-raised text-ink hover:bg-surface",
        ghost:
          "border-transparent bg-transparent text-muted hover:text-ink hover:bg-raised",
        unresolved:
          "border-unresolved bg-unresolved text-white hover:opacity-90",
        chaos:
          "border-chaos bg-chaos text-white hover:opacity-90",
        danger:
          "border-transparent bg-transparent text-unresolved hover:bg-unresolved-soft",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-3.5",
        lg: "h-11 px-5 text-base",
        icon: "h-9 w-9",
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
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { button as buttonVariants };
