import { cn } from "@/lib/utils";

/**
 * FIO — an unclosed ring with a single accent dot where the gap begins.
 * The ring closes as you figure the project out; the dot is the next thing.
 */
export function LogoMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M22.6 8.2 A10 10 0 1 1 9.4 8.2"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="22.6" cy="8.2" r="2.1" className="fill-accent" />
    </svg>
  );
}

export function Logo({
  className,
  markSize = 18,
  wordmark = true,
}: {
  className?: string;
  markSize?: number;
  wordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark size={markSize} className="text-ink-2" />
      {wordmark && (
        <span className="voice text-[19px] leading-none tracking-[0.01em]">FIO</span>
      )}
    </span>
  );
}
