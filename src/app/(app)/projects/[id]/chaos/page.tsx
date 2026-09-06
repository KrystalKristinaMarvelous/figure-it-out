import Link from "next/link";
import { getProject, getAllEntries, getQuestions, getRants } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { generateChaosCards } from "@/lib/chaos-gen";
import { ChaosDeck } from "./chaos-deck";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Chaos Mode — FIO" };

export default async function ChaosPage({ params, searchParams }: PageProps<"/projects/[id]/chaos"> ) {
  const { id } = await params;
  const sp = await searchParams;
  const roll = typeof sp.roll === "string" ? Number(sp.roll) : 0;

  const [project, entries, questions, rants] = await Promise.all([
    getProject(id),
    getAllEntries(id),
    getQuestions(id),
    getRants(id),
  ]);
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("links")
    .select("from_type, from_id, to_type, to_id")
    .eq("project_id", id);

  const totalMaterial = entries.length + questions.length;

  if (totalMaterial < 10) {
    return (
      <Card className="p-6">
        <h2 className="voice-lg">Chaos needs material to be chaotic with.</h2>
        <p className="mt-1 text-sm text-muted">
          You have {totalMaterial} things so far. Below about ten, a{" "}
          <Link href={`/projects/${id}/brainstorm`} className="text-unresolved underline">
            Prompted Brainstorm
          </Link>{" "}
          will do more for you. Come back once the project has more in it.
        </p>
      </Card>
    );
  }

  const cards = generateChaosCards(
    project.category,
    entries.map((e) => ({ id: e.id, title: e.title, moduleKey: e.moduleKey })),
    questions.filter((q) => q.status !== "resolved").map((q) => ({ id: q.id, text: q.text })),
    rants.map((r) => ({ id: r.id, body_text: r.body_text, transcript: r.transcript })),
    (links ?? []).map((l) => ({ a: `${l.from_type}:${l.from_id}`, b: `${l.to_type}:${l.to_id}` })),
    5,
    (roll + 1) * 0.6180339887,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="voice-lg">Chaos Mode</h2>
        <p className="text-sm text-muted">
          Five provocations, recombined from what&apos;s already in your project. Every noun is
          something you wrote — it can&apos;t make things up.
        </p>
      </div>
      <ChaosDeck projectId={id} cards={cards} roll={roll} />
    </div>
  );
}
