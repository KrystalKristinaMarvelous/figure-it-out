import Link from "next/link";
import { createClient, requireUser } from "@/lib/supabase/server";
import { findCategory } from "@/lib/schema/taxonomy";
import { shortDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import type { ProjectRow } from "@/lib/supabase/database.types";

export const metadata = { title: "Portfolio — FIO" };

export default async function Portfolio() {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .in("lifecycle", ["finished", "shelved"])
    .eq("is_example", false)
    .order("finished_at", { ascending: false });
  const all = (data ?? []) as ProjectRow[];
  const finished = all.filter((p) => p.lifecycle === "finished");
  const shelved = all.filter((p) => p.lifecycle === "shelved");

  const { data: qAgg } = await supabase.from("questions").select("status, project_id");
  const figuredOut = (qAgg ?? []).filter((q) => q.status === "resolved").length;

  const byCat: Record<string, number> = {};
  finished.forEach((p) => (byCat[p.category] = (byCat[p.category] ?? 0) + 1));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="voice-lg">Portfolio</h1>
        <p className="mt-1 text-[13px] text-muted">
          Everything you&apos;ve made — and the process behind it, which no file folder can keep.
        </p>
      </div>

      <Card className="p-4 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-muted">
          <span>
            <span className="text-ink">{finished.length}</span> finished
          </span>
          <span>
            <span className="text-ink">{shelved.length}</span> set aside
          </span>
          <span>
            <span className="text-ink">{figuredOut}</span> questions figured out
          </span>
          <span>
            {Object.entries(byCat)
              .map(([c, n]) => `${findCategory(c)?.label ?? c} ${n}`)
              .join(" · ")}
          </span>
        </div>
      </Card>

      {finished.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          Nothing finished yet. When a project is done, mark it finished and it lands here — with your
          original one-line idea next to the final one.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {finished.map((p) => {
            const refl = (p.reflection ?? {}) as Record<string, string>;
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="flex h-full flex-col p-4 hover:border-muted">
                  <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
                  <p className="text-xs text-muted">
                    {findCategory(p.category)?.label} · {p.finished_at ? new Date(p.finished_at).getFullYear() : ""}
                  </p>
                  {p.original_one_liner && (
                    <p className="voice mt-2 text-xs text-muted">
                      Started as: “{p.original_one_liner}”
                    </p>
                  )}
                  {refl.turned_out && (
                    <p className="voice mt-1 line-clamp-3 text-sm text-ink">{refl.turned_out}</p>
                  )}
                  <p className="mt-auto pt-2 text-xs text-muted">
                    finished {shortDate(p.finished_at)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {shelved.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Set aside</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {shelved.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="p-3 text-sm hover:border-muted">
                  <span className="font-medium text-ink">{p.title}</span>
                  <p className="text-xs text-muted">{p.one_liner}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
