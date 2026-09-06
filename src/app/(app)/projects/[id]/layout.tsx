import { getProject, getProjectModules } from "@/lib/data";
import { findCategory, findSubtype, READINESS_META } from "@/lib/schema/taxonomy";
import { ProjectNav } from "./project-nav";

export default async function ProjectLayout({
  params,
  children,
}: LayoutProps<"/projects/[id]">) {
  const { id } = await params;
  const [project, modules] = await Promise.all([getProject(id), getProjectModules(id)]);
  const cat = findCategory(project.category);
  const sub = findSubtype(project.category, project.subtype);
  const rm = READINESS_META[project.readiness];

  const moduleLinks = modules
    .filter((m) => !["rant_space", "open_questions", "activity_log"].includes(m.def.key))
    .map((m) => ({
      href: `/projects/${id}/m/${m.pm.id}`,
      label: m.name,
      icon: m.def.icon,
    }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">{project.title}</h1>
          <p className="text-xs text-muted">
            {cat?.label} → {sub?.label ?? project.subtype} · <span title={rm.label}>{rm.glyph} {rm.label}</span>
          </p>
        </div>
      </div>
      <ProjectNav projectId={id} moduleLinks={moduleLinks} />
      {children}
    </div>
  );
}
