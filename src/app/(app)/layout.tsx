import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getUnreadCount } from "@/lib/data-social";
import { ThemeToggle, PrefSync } from "@/components/theme";
import { CommandBar } from "@/components/command-bar";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const name =
    (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "you";

  const supabase = await createClient();
  const [{ data: projects }, { data: me }, unread] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title")
      .eq("lifecycle", "active")
      .eq("is_example", false)
      .order("last_touched_at", { ascending: false })
      .limit(50),
    supabase.from("users").select("settings").eq("id", user.id).maybeSingle(),
    getUnreadCount(),
  ]);
  const settings = (me?.settings ?? {}) as { theme?: string; skin?: string };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PrefSync theme={settings.theme} skin={settings.skin} />
      <header className="sticky top-0 z-30 border-b border-hairline-2 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5">
          <nav className="flex items-center gap-1 text-[13px]">
            <Link href="/dashboard" className="mr-3">
              <Logo />
            </Link>
            <NavLink href="/dashboard">Projects</NavLink>
            <NavLink href="/portfolio">Portfolio</NavLink>
            <NavLink href="/people">People</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <CommandBar projects={projects ?? []} />
            <Link
              href="/messages"
              aria-label="Messages"
              className="relative grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-accent-wash hover:text-accent-ink"
            >
              <MessageCircle size={15} />
              {unread > 0 && (
                <span className="mono absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <AccountMenu name={name} email={user.email ?? ""} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 font-medium text-muted transition-colors hover:bg-accent-wash hover:text-accent-ink"
    >
      {children}
    </Link>
  );
}
