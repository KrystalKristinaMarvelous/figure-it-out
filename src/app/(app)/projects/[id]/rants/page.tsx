import { getProject, getProjectModules, getRants } from "@/lib/data";
import { RantSpace } from "./rant-space";

export const metadata = { title: "Rant Space — FIO" };

export default async function RantsPage({ params }: PageProps<"/projects/[id]/rants"> ) {
  const { id } = await params;
  const [project, modules, rants] = await Promise.all([
    getProject(id),
    getProjectModules(id),
    getRants(id),
  ]);

  const targets = modules
    .filter((m) => !["rant_space", "activity_log"].includes(m.def.key))
    .map((m) => ({ pmId: m.pm.id, key: m.def.key, name: m.name, schema: m.def.entrySchema }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="voice text-2xl text-ink">Rant Space</h2>
        <p className="text-sm text-muted">
          Everything in your head about {project.title}, in the order you thought it. No structure,
          no decisions. Mine it later.
        </p>
      </div>
      <RantSpace projectId={id} rants={rants} targets={targets} />
    </div>
  );
}
