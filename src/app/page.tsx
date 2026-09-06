import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";
import { Logo } from "@/components/logo";

export default async function Landing() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <Logo markSize={20} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mt-28 animate-rise">
        <p className="eyebrow text-accent-ink">Figure it out first</p>
        <h1 className="voice-xl mt-4">
          A workspace for figuring out, planning, and tracking <em>any</em> project.
        </h1>
        <p className="voice mt-6 max-w-xl text-[16px] text-muted">
          A novel, a science fair entry, a campaign, a wedding, a dissertation, a game, a trip, a
          business. Nothing serves the stretch where you have material but no shape — and that&apos;s
          where most projects live longest, and where people most often give up. This does.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/signup">Start a project</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">I have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mt-28 grid gap-x-10 gap-y-10 border-t border-hairline pt-10 sm:grid-cols-3">
        {[
          [
            "Two choices, a whole workspace",
            "Pick what you're making and where you are with it. Opinionated, pre-built modules assemble themselves — and stay editable forever.",
          ],
          [
            "Three ways in",
            "Rant freely. Brainstorm with prompts that produce many answers. Commit to one answer inside a module. Diverge, then converge.",
          ],
          [
            "Progress you can trust",
            "The unit isn't words written — it's questions answered. Not knowing gets tracked, not hidden. The project visibly quiets as you work it out.",
          ],
        ].map(([h, b]) => (
          <div key={h}>
            <h3 className="text-[13px] font-medium text-ink">{h}</h3>
            <p className="voice mt-2 text-[13.5px] leading-snug text-muted">{b}</p>
          </div>
        ))}
      </section>

      <footer className="mono mt-24 text-[11px] uppercase tracking-[0.06em] text-faint">
        Nothing is built inside the app. You figure it out here, build it elsewhere, then bring the
        finished thing back to your Portfolio.
      </footer>
    </main>
  );
}
