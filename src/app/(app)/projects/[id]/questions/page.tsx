import { getProject, getQuestions } from "@/lib/data";
import { QuestionsBoard } from "./questions-board";

export const metadata = { title: "Open Questions — FIO" };

export default async function QuestionsPage({ params }: PageProps<"/projects/[id]/questions"> ) {
  const { id } = await params;
  const [project, questions] = await Promise.all([getProject(id), getQuestions(id)]);
  const resolved = questions.filter((q) => q.status === "resolved").length;
  const open = questions.length - resolved;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="voice text-2xl text-ink">
          You&apos;ve figured out {resolved} {resolved === 1 ? "thing" : "things"} about this project.
        </h2>
        <p className="text-sm text-muted">
          {open} still open. {project.readiness !== "defined" && "Questions rising is the main evidence of progress this early — not a warning."}
        </p>
      </div>
      <QuestionsBoard projectId={id} questions={questions} />
    </div>
  );
}
