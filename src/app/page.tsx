import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme";

export default async function Landing() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="voice text-2xl italic text-ink">FIO</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <section className="mt-20">
        <p className="text-sm font-medium tracking-wide text-unresolved">Figure it out first.</p>
        <h1 className="voice mt-3 text-4xl leading-tight text-ink sm:text-5xl">
          A workspace for figuring out, planning, and tracking <em>any</em> project.
        </h1>
        <p className="voice mt-5 max-w-xl text-lg text-muted">
          A novel, a science fair entry, a campaign, a wedding, a dissertation, a game, a trip, a
          business. Nothing serves the stretch where you have material but no shape — and that&apos;s
          where most projects live longest. This does.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/signup">Start a project</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">I have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mt-24 grid gap-8 sm:grid-cols-3">
        {[
          ["Two choices, a whole workspace", "Pick what you're making and where you are with it. Opinionated, pre-built modules assemble themselves — and stay editable forever."],
          ["Three ways in", "Rant freely. Brainstorm with prompts that produce many answers. Commit to one answer inside a module. Diverge, then converge."],
          ["Progress you can trust", "The unit isn't words written — it's questions answered. Not knowing gets tracked, not hidden."],
        ].map(([h, b]) => (
          <div key={h}>
            <h3 className="text-sm font-semibold text-ink">{h}</h3>
            <p className="voice mt-1.5 text-sm text-muted">{b}</p>
          </div>
        ))}
      </section>

      <footer className="mt-24 border-t border-hairline pt-6 text-xs text-muted">
        Nothing is built inside the app. You figure it out here, build it elsewhere, then bring the
        finished thing back to your Portfolio.
      </footer>
    </main>
  );
}
