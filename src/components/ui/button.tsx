import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const button = cva(
  "pressable inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold whitespace-nowrap transition-[background-color,border-color,box-shadow,color] disabled:pointer-events-none disabled:opacity-45 select-none",
  {
    variants: {
      variant: {
        primary:
          "border-accent bg-accent text-white shadow-[var(--shadow-1)] hover:brightness-[1.06] hover:shadow-[var(--shadow-2)]",
        ink: "border-ink bg-ink text-bg hover:bg-ink-2 hover:border-ink-2",
        outline:
          "border-hairline bg-paper text-ink shadow-[var(--shadow-1)] hover:border-accent hover:text-accent-ink",
        ghost: "border-transparent bg-transparent text-muted hover:bg-accent-wash hover:text-accent-ink",
        unresolved:
          "border-accent bg-accent text-white shadow-[var(--shadow-1)] hover:brightness-[1.06]",
        chaos: "border-chaos bg-chaos text-white shadow-[var(--shadow-1)] hover:brightness-110",
        danger: "border-transparent bg-transparent text-accent-ink hover:bg-accent-wash",
      },
      size: {
        xs: "h-6 px-2.5 text-[11px]",
        sm: "h-8 px-3.5 text-[12.5px]",
        md: "h-[38px] px-5 text-[13px]",
        lg: "h-[46px] px-7 text-[14.5px]",
        icon: "h-8 w-8 px-0",
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
