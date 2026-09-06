import { notFound } from "next/navigation";
import { getProject, getProjectModules } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { promptsForTopic } from "@/content/prompts";
import { BrainstormSession } from "./session";

export default async function SessionPage({
  params,
}: PageProps<"/projects/[id]/brainstorm/[sessionId]">) {
  const { id, sessionId } = await params;
  const [project, modules] = await Promise.all([getProject(id), getProjectModules(id)]);
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("brainstorm_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("project_id", id)
    .maybeSingle();
  if (!session) notFound();

  const { data: responses } = await supabase
    .from("brainstorm_responses")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index");

  const prompts = session.topics.flatMap((topic: string) =>
    promptsForTopic(topic, project.category, project.subtype).map((p) => ({
      key: p.key,
      topic,
      question: p.question,
      hint: p.hint ?? null,
      alternates: p.alternates ?? [],
    })),
  );

  const targets = modules
    .filter((m) => !["rant_space", "activity_log", "open_questions"].includes(m.def.key))
    .map((m) => ({ pmId: m.pm.id, name: m.name }));

  return (
    <BrainstormSession
      projectId={id}
      sessionId={sessionId}
      status={session.status}
      prompts={prompts}
      responses={responses ?? []}
      targets={targets}
    />
  );
}
