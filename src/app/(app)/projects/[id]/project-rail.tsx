"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  title: string;
  crumb: string;
  readinessGlyph: string;
  readinessLabel: string;
  openQuestions: number;
  moduleLinks: { href: string; label: string; icon: string }[];
  lifecycle: string;
}

export function ProjectRail(props: Props) {
  const [open, setOpen] = useState(false);
  const base = `/projects/${props.projectId}`;

  return (
    <>
      {/* mobile bar */}
      <div className="flex items-center gap-3 border-b border-hairline-2 px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="pressable grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-hairline bg-paper"
          aria-label="Menu"
        >
          {open ? <X size={15} /> : <Menu size={15} />}
        </button>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">{props.title}</p>
          <p className="truncate text-[11px] text-faint">{props.crumb}</p>
        </div>
      </div>

      <aside
        className={cn(
          "shrink-0 border-hairline-2 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:w-60 lg:overflow-y-auto lg:border-r lg:py-6",
          open ? "block border-b px-4 py-4" : "hidden",
        )}
      >
        <div className="hidden px-4 lg:block">
          <h1 className="screen-title leading-snug">{props.title}</h1>
          <p className="mt-1 text-[11.5px] text-faint">{props.crumb}</p>
          <p className="mt-1.5 text-[11.5px] text-muted" title={props.readinessLabel}>
            {props.readinessGlyph} {props.readinessLabel}
          </p>
        </div>

        <nav className="mt-0 space-y-5 lg:mt-6 lg:px-2">
          <Group title="Think">
            <Item base={base} href={base} exact icon="LayoutDashboard" onNav={() => setOpen(false)}>
              Overview
            </Item>
            <Item
              base={base}
              href={`${base}/questions`}
              icon="CircleHelp"
              onNav={() => setOpen(false)}
              trailing={
                props.openQuestions > 0 ? (
                  <span className="tnum text-[11px] font-semibold text-unresolved">
                    {props.openQuestions}
                  </span>
                ) : null
              }
            >
              Open Questions
            </Item>
            <Item base={base} href={`${base}/rants`} icon="Mic" onNav={() => setOpen(false)}>
              Rant Space
            </Item>
            <Item base={base} href={`${base}/brainstorm`} icon="Sparkles" onNav={() => setOpen(false)}>
              Brainstorm
            </Item>
            <Item base={base} href={`${base}/chaos`} icon="Shuffle" onNav={() => setOpen(false)}>
              Chaos Mode
            </Item>
          </Group>

          {props.moduleLinks.length > 0 && (
            <Group title="Modules">
              {props.moduleLinks.map((m) => (
                <Item key={m.href} base={base} href={m.href} icon={m.icon} onNav={() => setOpen(false)}>
                  {m.label}
                </Item>
              ))}
            </Group>
          )}

          <Group title="">
            <Item base={base} href={`${base}/library`} icon="Plus" onNav={() => setOpen(false)}>
              Add a module
            </Item>
            <a
              href={`${base}/export?format=md`}
              className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[12.5px] text-muted hover:bg-raised hover:text-ink"
            >
              <Icon name="Download" size={14} /> Export
            </a>
            <Item
              base={base}
              href={`${base}/finish`}
              icon={props.lifecycle === "finished" ? "RotateCcw" : "Flag"}
              onNav={() => setOpen(false)}
            >
              {props.lifecycle === "finished" ? "Reopen" : "Finish or set aside"}
            </Item>
          </Group>
        </nav>
      </aside>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <p className="eyebrow mb-1.5 px-2.5">{title}</p>}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Item({
  base,
  href,
  exact,
  icon,
  children,
  trailing,
  onNav,
}: {
  base: string;
  href: string;
  exact?: boolean;
  icon: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  onNav?: () => void;
}) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNav}
      className={cn(
        "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[12.5px] transition-colors",
        active
          ? "bg-raised font-medium text-ink"
          : "text-muted hover:bg-raised hover:text-ink",
      )}
    >
      <Icon name={icon} size={14} className={active ? "text-ink" : "text-faint"} />
      <span className="flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}
