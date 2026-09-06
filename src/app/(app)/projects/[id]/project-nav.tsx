"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function ProjectNav({
  projectId,
  moduleLinks,
}: {
  projectId: string;
  moduleLinks: { href: string; label: string; icon: string }[];
}) {
  const path = usePathname();
  const base = `/projects/${projectId}`;
  const fixed = [
    { href: base, label: "Overview", icon: "LayoutDashboard", exact: true },
    { href: `${base}/questions`, label: "Open Questions", icon: "CircleHelp" },
    { href: `${base}/rants`, label: "Rant Space", icon: "Mic" },
    { href: `${base}/brainstorm`, label: "Brainstorm", icon: "Sparkles" },
    { href: `${base}/chaos`, label: "Chaos Mode", icon: "Shuffle" },
  ];

  const item = (l: { href: string; label: string; icon: string; exact?: boolean }) => {
    const active = l.exact ? path === l.href : path.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm",
          active ? "bg-raised font-medium text-ink" : "text-muted hover:text-ink",
        )}
      >
        <Icon name={l.icon} size={13} />
        {l.label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-hairline pb-2">
      {fixed.map(item)}
      {moduleLinks.length > 0 && <span className="mx-1 text-hairline">|</span>}
      {moduleLinks.map(item)}
      <Link
        href={`${base}/library`}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted hover:text-ink"
      >
        <Icon name="Plus" size={13} /> Modules
      </Link>
    </nav>
  );
}
