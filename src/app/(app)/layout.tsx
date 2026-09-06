import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme";
import { CommandBar } from "@/components/command-bar";

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
      <header className="sticky top-0 z-30 border-b border-hairline bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-5 text-sm">
            <Link href="/dashboard" className="voice text-lg italic text-ink">
              FIO
            </Link>
            <Link href="/dashboard" className="text-muted hover:text-ink">
              Projects
            </Link>
            <Link href="/portfolio" className="text-muted hover:text-ink">
              Portfolio
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <CommandBar projects={projects ?? []} />
            <ThemeToggle />
            <span className="hidden text-xs text-muted sm:inline">{name}</span>
            <form action="/auth/signout" method="post">
              <button className="text-xs text-muted hover:text-unresolved">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
