import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "pressable inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] font-medium tracking-[-0.005em] whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-[#fdf6f0] hover:bg-accent-ink",
        ink: "bg-ink text-bg hover:opacity-90",
        outline:
          "border border-hairline bg-transparent text-ink hover:border-accent hover:text-accent-ink",
        ghost: "text-muted hover:bg-accent-wash hover:text-accent-ink",
        unresolved: "bg-accent text-[#fdf6f0] hover:bg-accent-ink",
        chaos: "bg-chaos text-[#f2f1fb] hover:opacity-90",
        danger: "text-accent-ink hover:bg-accent-wash",
      },
      size: {
        xs: "h-6 px-2 text-[11px]",
        sm: "h-8 px-3 text-[12px]",
        md: "h-9 px-4 text-[12.5px]",
        lg: "h-11 px-6 text-[13.5px]",
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
