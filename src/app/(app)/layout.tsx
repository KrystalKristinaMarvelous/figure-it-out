import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme";
import { CommandBar } from "@/components/command-bar";
import { AccountMenu } from "@/components/account-menu";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const name =
    (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "you";

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("lifecycle", "active")
    .eq("is_example", false)
    .order("last_touched_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-hairline-2 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5">
          <nav className="flex items-center gap-1 text-[13px]">
            <Link
              href="/dashboard"
              className="voice mr-3 text-[19px] leading-none text-ink"
            >
              FIO
            </Link>
            <NavLink href="/dashboard">Projects</NavLink>
            <NavLink href="/portfolio">Portfolio</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <CommandBar projects={projects ?? []} />
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
