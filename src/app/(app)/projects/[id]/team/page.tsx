import { notFound } from "next/navigation";
import { getProject, getProjectModules } from "@/lib/data";
import { getProjectAccess, getTeam, getTasks } from "@/lib/data-collab";
import { getUser } from "@/lib/supabase/server";
import { TeamClient } from "./team-client";

export const metadata = { title: "Team — FIO" };

export default async function TeamPage({ params }: PageProps<"/projects/[id]/team">) {
  const { id } = await params;
  const [access, user] = await Promise.all([getProjectAccess(id), getUser()]);
  if (!access.role) notFound();

  const [project, team, tasks, modules] = await Promise.all([
    getProject(id),
    getTeam(id),
    getTasks(id),
    getProjectModules(id),
  ]);
  if (!team) notFound();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="screen-title text-[17px]">Team</h1>
        <p className="voice measure mt-1.5 text-[13.5px] text-muted">
          {access.isOwner
            ? "Share a link to bring someone in. Editors can only touch the modules you assign them on the checklist."
            : "What you can work on here is whatever the owner has assigned to you below."}
        </p>
      </header>

      <TeamClient
        projectId={id}
        projectTitle={project.title}
        isOwner={access.isOwner}
        myUserId={user?.id ?? ""}
        roster={team.roster}
        invites={team.invites}
        tasks={tasks}
        modules={modules.map((m) => ({ id: m.pm.id, name: m.name }))}
      />
    </div>
  );
}
