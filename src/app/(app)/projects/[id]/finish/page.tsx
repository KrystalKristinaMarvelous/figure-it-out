import { getProject } from "@/lib/data";
import { FinishFlow } from "./finish-flow";

export const metadata = { title: "Finish — FIO" };

export default async function FinishPage({ params }: PageProps<"/projects/[id]/finish"> ) {
  const { id } = await params;
  const project = await getProject(id);
  return (
    <div className="mx-auto max-w-xl">
      <FinishFlow
        projectId={id}
        title={project.title}
        originalOneLiner={project.original_one_liner}
        oneLiner={project.one_liner}
        lifecycle={project.lifecycle}
      />
    </div>
  );
}
