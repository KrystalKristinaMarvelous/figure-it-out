import { getProject, getQuestions } from "@/lib/data";
import { QuestionsBoard } from "./questions-board";

export const metadata = { title: "Open Questions — FIO" };

export default async function QuestionsPage({ params }: PageProps<"/projects/[id]/questions">) {
  const { id } = await params;
  const [project, questions] = await Promise.all([getProject(id), getQuestions(id)]);
  const resolved = questions.filter((q) => q.status === "resolved").length;
  const open = questions.length - resolved;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-1.5">Open Questions · the spine</p>
        <h1 className="voice-lg">
          You&apos;ve figured out{" "}
          <span className="tnum text-ink">{resolved}</span>{" "}
          {resolved === 1 ? "thing" : "things"}.
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          <span className="tnum">{open}</span> still open.{" "}
          {project.readiness !== "defined" &&
            "Questions rising is the main evidence of progress this early — not a warning."}
        </p>
      </header>
      <QuestionsBoard projectId={id} questions={questions} />
    </div>
  );
}
