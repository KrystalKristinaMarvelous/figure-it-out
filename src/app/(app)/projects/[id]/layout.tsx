import { getProject, getProjectModules, getQuestionCounts } from "@/lib/data";
import { findCategory, findSubtype } from "@/lib/schema/taxonomy";
import { ProjectRail } from "./project-rail";

export default async function ProjectLayout({
  params,
  children,
}: LayoutProps<"/projects/[id]">) {
  const { id } = await params;
  const [project, modules, counts] = await Promise.all([
    getProject(id),
    getProjectModules(id),
    getQuestionCounts(id),
  ]);
  const cat = findCategory(project.category);
  const sub = findSubtype(project.category, project.subtype);

  const moduleLinks = modules
    .filter((m) => !["rant_space", "open_questions", "activity_log"].includes(m.def.key))
    .map((m) => ({
      href: `/projects/${id}/m/${m.pm.id}`,
      label: m.name,
      icon: m.def.icon,
    }));

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
      <ProjectRail
        projectId={id}
        title={project.title}
        crumb={`${cat?.label} · ${sub?.label ?? project.subtype}`}
        readiness={project.readiness}
        openQuestions={counts.open}
        moduleLinks={moduleLinks}
        lifecycle={project.lifecycle}
      />
      <div className="min-w-0 flex-1 px-5 py-8 sm:px-12 lg:px-16">
        <div className="max-w-[38rem] animate-rise">{children}</div>
      </div>
    </div>
  );
}
