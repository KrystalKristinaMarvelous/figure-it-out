import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";

export default async function Landing() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <span className="voice text-[22px] italic tracking-[-0.02em] text-ink">FIO</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mt-24 animate-rise">
        <p className="text-[13px] font-medium tracking-[-0.01em] text-unresolved">
          Figure it out first.
        </p>
        <h1 className="voice-xl mt-3">
          A workspace for figuring out, planning, and tracking <em>any</em> project.
        </h1>
        <p className="voice mt-5 max-w-xl text-[16px] text-muted">
          A novel, a science fair entry, a campaign, a wedding, a dissertation, a game, a trip, a
          business. Nothing serves the stretch where you have material but no shape — and that&apos;s
          where most projects live longest, and where people most often give up. This does.
        </p>
        <div className="mt-9 flex gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/signup">Start a project</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">I have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mt-28 grid gap-x-8 gap-y-10 sm:grid-cols-3">
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
            <h3 className="text-[13px] font-semibold text-ink">{h}</h3>
            <p className="voice mt-1.5 text-[13.5px] leading-snug text-muted">{b}</p>
          </div>
        ))}
      </section>

      <footer className="mt-28 border-t border-hairline-2 pt-6 text-[12px] text-faint">
        Nothing is built inside the app. You figure it out here, build it elsewhere, then bring the
        finished thing back to your Portfolio.
      </footer>
    </main>
  );
}
