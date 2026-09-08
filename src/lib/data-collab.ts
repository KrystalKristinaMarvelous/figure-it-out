import "server-only";

import { cache } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getModuleDef } from "@/content/modules";
import type {
  ProfileRow,
  ProjectInviteRow,
  ProjectRow,
  ProjectTaskRow,
} from "@/lib/supabase/database.types";

export type ProjectRole = "owner" | "editor" | "viewer" | null;

export interface ProjectAccess {
  role: ProjectRole;
  isOwner: boolean;
  canEdit: boolean;
  /** project_module ids this user may create/edit entries in */
  editableModuleIds: Set<string>;
}

export const getProjectAccess = cache(
  async (projectId: string): Promise<ProjectAccess> => {
    const user = await getUser();
    const empty: ProjectAccess = {
      role: null,
      isOwner: false,
      canEdit: false,
      editableModuleIds: new Set(),
    };
    if (!user) return empty;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .maybeSingle();
    if (!project) return empty;

    if (project.user_id === user.id) {
      return { role: "owner", isOwner: true, canEdit: true, editableModuleIds: new Set() };
    }

    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!member) return empty;

    let editableModuleIds = new Set<string>();
    if (member.role === "editor") {
      const { data: tasks } = await supabase
        .from("project_tasks")
        .select("project_module_id")
        .eq("project_id", projectId)
        .eq("assignee_id", user.id);
      editableModuleIds = new Set(
        (tasks ?? [])
          .map((t) => t.project_module_id)
          .filter((v): v is string => Boolean(v)),
      );
    }
    return {
      role: member.role,
      isOwner: false,
      canEdit: member.role === "editor",
      editableModuleIds,
    };
  },
);

export interface TeamMember {
  profile: ProfileRow | null;
  userId: string;
  role: "owner" | "editor" | "viewer";
}

export const getTeam = cache(async (projectId: string) => {
  const user = await getUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("user_id, title")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return null;

  const isOwner = !!user && project.user_id === user.id;

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("user_id, role, created_at")
    .eq("project_id", projectId)
    .order("created_at");
  const members = memberRows ?? [];

  const ids = [project.user_id, ...members.map((m) => m.user_id)].filter(
    (v): v is string => Boolean(v),
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));

  const roster: TeamMember[] = [
    { profile: pmap.get(project.user_id!) ?? null, userId: project.user_id!, role: "owner" },
    ...members.map((m) => ({
      profile: pmap.get(m.user_id) ?? null,
      userId: m.user_id,
      role: m.role as "editor" | "viewer",
    })),
  ];

  let invites: { view: ProjectInviteRow | null; edit: ProjectInviteRow | null } = {
    view: null,
    edit: null,
  };
  if (isOwner) {
    const { data: inviteRows } = await supabase
      .from("project_invites")
      .select("*")
      .eq("project_id", projectId)
      .is("revoked_at", null);
    for (const inv of (inviteRows ?? []) as ProjectInviteRow[]) {
      if (inv.access === "view") invites.view = inv;
      else invites.edit = inv;
    }
  }

  return { isOwner, title: project.title as string, roster, invites };
});

export interface ResolvedTask extends ProjectTaskRow {
  assignee: ProfileRow | null;
  moduleName: string | null;
}

export const getTasks = cache(async (projectId: string): Promise<ResolvedTask[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_tasks")
    .select("*, project_modules(custom_name, module_definitions(key))")
    .eq("project_id", projectId)
    .order("order_index")
    .order("created_at");
  const rows = (data ?? []) as (ProjectTaskRow & {
    project_modules: {
      custom_name: string | null;
      module_definitions: { key: string } | null;
    } | null;
  })[];

  const assigneeIds = [
    ...new Set(rows.map((r) => r.assignee_id).filter((v): v is string => Boolean(v))),
  ];
  const { data: profiles } = assigneeIds.length
    ? await supabase.from("profiles").select("*").in("id", assigneeIds)
    : { data: [] };
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p as ProfileRow]));

  return rows.map((r) => {
    const key = r.project_modules?.module_definitions?.key;
    const def = key ? getModuleDef(key) : undefined;
    return {
      ...r,
      assignee: r.assignee_id ? (pmap.get(r.assignee_id) ?? null) : null,
      moduleName: r.project_modules?.custom_name ?? def?.name ?? null,
    };
  });
});

/** Projects the current user collaborates on (does not own). */
export const getSharedProjects = cache(async () => {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();

  const { data: memberRows } = await supabase
    .from("project_members")
    .select("project_id, role")
    .eq("user_id", user.id);
  const rows = memberRows ?? [];
  if (rows.length === 0) return [];

  const roleByProject = new Map(rows.map((r) => [r.project_id, r.role as "editor" | "viewer"]));
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("id", [...roleByProject.keys()])
    .neq("lifecycle", "finished")
    .order("last_touched_at", { ascending: false });
  const list = (projects ?? []) as ProjectRow[];

  const ownerIds = [...new Set(list.map((p) => p.user_id).filter(Boolean))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("*").in("id", ownerIds)
    : { data: [] };
  const omap = new Map((owners ?? []).map((p) => [p.id, p as ProfileRow]));

  return list.map((p) => ({
    project: p,
    role: roleByProject.get(p.id) ?? "viewer",
    owner: omap.get(p.user_id) ?? null,
  }));
});
