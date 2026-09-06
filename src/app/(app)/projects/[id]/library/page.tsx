import { getProject, getProjectModules } from "@/lib/data";
import { ALL_MODULES } from "@/content/modules";
import { LibraryBrowser } from "./library-browser";

export const metadata = { title: "Module library — FIO" };

export default async function LibraryPage({ params }: PageProps<"/projects/[id]/library"> ) {
  const { id } = await params;
  const [project, modules] = await Promise.all([getProject(id), getProjectModules(id, true)]);

  const state = new Map(modules.map((m) => [m.def.key, m.pm.status]));

  const list = ALL_MODULES.filter(
    (m) => m.universal || !m.categoryAffinity?.length || m.categoryAffinity.includes(project.category),
  ).map((m) => ({
    key: m.key,
    name: m.name,
    icon: m.icon,
    intro: m.intro,
    presentation: m.presentation,
    fields: m.entrySchema.slice(0, 6).map((f) => f.label),
    universal: !!m.universal,
    status: state.get(m.key) ?? null,
  }));

  const other = ALL_MODULES.filter(
    (m) => !m.universal && m.categoryAffinity?.length && !m.categoryAffinity.includes(project.category),
  ).map((m) => ({
    key: m.key,
    name: m.name,
    icon: m.icon,
    intro: m.intro,
    presentation: m.presentation,
    fields: m.entrySchema.slice(0, 6).map((f) => f.label),
    universal: false,
    status: state.get(m.key) ?? null,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="voice-lg">Module library</h2>
        <p className="text-sm text-muted">
          Any module can be added to any project — a business plan can take Three-Act Structure; a
          novelist can take the academic Sources module. Removing archives; re-adding restores.
        </p>
      </div>
      <LibraryBrowser projectId={id} modules={list} otherModules={other} />
    </div>
  );
}
