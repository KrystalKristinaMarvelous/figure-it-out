import Link from "next/link";
import { getProject } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { topicsForCategory } from "@/content/prompts";
import { relativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BrainstormStart } from "./brainstorm-start";

export const metadata = { title: "Brainstorm — FIO" };

export default async function BrainstormIndex({ params }: PageProps<"/projects/[id]/brainstorm"> ) {
  const { id } = await params;
  const project = await getProject(id);
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("brainstorm_sessions")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const topics = topicsForCategory(project.category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="voice text-2xl text-ink">What are you trying to figure out?</h2>
        <p className="text-sm text-muted">
          One prompt at a time. Multiple answers per prompt, encouraged — one answer is a form, five
          is a brainstorm.
        </p>
      </div>

      <BrainstormStart projectId={id} topics={topics} />

      {(sessions ?? []).length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Earlier sessions</h3>
          <div className="space-y-2">
            {(sessions ?? []).map((s) => (
              <Link key={s.id} href={`/projects/${id}/brainstorm/${s.id}`}>
                <Card className="flex items-center justify-between p-3 text-sm hover:border-muted">
                  <span className="text-ink">{s.topics.join(", ") || "General"}</span>
                  <span className="text-xs text-muted">
                    {s.status === "reviewed" ? "reviewed" : "open"} · {relativeTime(s.created_at)}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
