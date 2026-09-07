"use client";

import Link from "next/link";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { LogOut, Settings, UserRound } from "lucide-react";
import { initials } from "@/lib/utils";

export function AccountMenu({ name, email }: { name: string; email: string }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          className="pressable grid h-8 w-8 place-items-center rounded-full border border-hairline bg-paper text-[11px] font-semibold text-ink-2 hover:border-muted"
          aria-label="Account"
        >
          {initials(name) || "?"}
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="animate-pop z-50 min-w-52 rounded-[var(--radius)] border border-hairline bg-surface p-1 shadow-[var(--shadow-pop)]"
        >
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-medium text-ink">{name}</p>
            <p className="truncate text-[11.5px] text-faint">{email}</p>
          </div>
          <Dropdown.Separator className="my-1 h-px bg-hairline-2" />
          <Dropdown.Item asChild>
            <Link
              href="/me"
              className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] text-muted outline-none hover:bg-raised hover:text-ink"
            >
              <UserRound size={13} /> My profile
            </Link>
          </Dropdown.Item>
          <Dropdown.Item asChild>
            <Link
              href="/settings"
              className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[13px] text-muted outline-none hover:bg-raised hover:text-ink"
            >
              <Settings size={13} /> Settings &amp; themes
            </Link>
          </Dropdown.Item>
          <Dropdown.Separator className="my-1 h-px bg-hairline-2" />
          <Dropdown.Item asChild>
            <form action="/auth/signout" method="post">
              <button className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[13px] text-muted outline-none hover:bg-raised hover:text-ink">
                <LogOut size={13} /> Sign out
              </button>
            </form>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
