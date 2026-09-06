import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { getModuleDef } from "@/content/modules";
import type { ModuleDef } from "@/lib/schema/types";
import type {
  ActivityRow,
  EntryRow,
  ProjectModuleRow,
  ProjectRow,
  QuestionRow,
  RantRow,
} from "@/lib/supabase/database.types";

export interface ResolvedModule {
  pm: ProjectModuleRow;
  def: ModuleDef;
  name: string;
}

export const getProject = cache(async (id: string): Promise<ProjectRow> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();
  return data;
});

export const getProjectModules = cache(
  async (projectId: string, includeArchived = false): Promise<ResolvedModule[]> => {
    const supabase = await createClient();
    let query = supabase
      .from("project_modules")
      .select("*, module_definitions(key)")
      .eq("project_id", projectId)
      .order("order_index");
    if (!includeArchived) query = query.eq("status", "active");
    const { data } = await query;
    const rows = (data ?? []) as (ProjectModuleRow & {
      module_definitions: { key: string } | null;
    })[];
    return rows
      .map((row) => {
        const key = row.module_definitions?.key;
        const def = key ? getModuleDef(key) : undefined;
        if (!def) return null;
        return { pm: row, def, name: row.custom_name ?? def.name } as ResolvedModule;
      })
      .filter((m): m is ResolvedModule => Boolean(m));
  },
);

export const getModuleByPmId = cache(
  async (projectId: string, pmId: string): Promise<ResolvedModule> => {
    const mods = await getProjectModules(projectId, true);
    const found = mods.find((m) => m.pm.id === pmId);
    if (!found) notFound();
    return found;
  },
);

export const getEntries = cache(
  async (pmId: string): Promise<EntryRow[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("project_module_id", pmId)
      .order("order_index")
      .order("created_at");
    return data ?? [];
  },
);

/** All entries in a project, keyed by module key — for references, chaos, gaps. */
export const getAllEntries = cache(async (projectId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("*, project_modules(id, module_definitions(key))")
    .eq("project_id", projectId)
    .order("created_at");
  const rows = (data ?? []) as (EntryRow & {
    project_modules: { id: string; module_definitions: { key: string } | null } | null;
  })[];
  return rows.map((r) => ({
    ...r,
    moduleKey: r.project_modules?.module_definitions?.key ?? null,
  }));
});

export const getQuestions = cache(async (projectId: string): Promise<QuestionRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  return data ?? [];
});

export const getRants = cache(async (projectId: string): Promise<RantRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rants")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getActivity = cache(
  async (projectId: string, limit = 40): Promise<ActivityRow[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("activity")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  },
);

export interface PulseRow {
  pmId: string;
  key: string;
  label: string;
  count: number;
  delta: number;
  subLabel?: string;
}

export const getPulse = cache(async (projectId: string): Promise<PulseRow[]> => {
  const supabase = await createClient();
  const [mods, entriesRes, questionsRes] = await Promise.all([
    getProjectModules(projectId),
    supabase.from("entries").select("project_module_id, created_at").eq("project_id", projectId),
    supabase.from("questions").select("status, created_at").eq("project_id", projectId),
  ]);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const entries = entriesRes.data ?? [];
  const questions = questionsRes.data ?? [];

  return mods
    .filter((m) => m.def.key !== "activity_log")
    .map((m) => {
      if (m.def.key === "open_questions") {
        const open = questions.filter((q) => q.status !== "resolved").length;
        const recent = questions.filter(
          (q) => new Date(q.created_at).getTime() > weekAgo,
        ).length;
        return {
          pmId: m.pm.id,
          key: m.def.key,
          label: (m.def.plural ?? "questions").toUpperCase(),
          count: open,
          delta: recent,
          subLabel: `${questions.length - open} figured out`,
        };
      }
      const mine = entries.filter((e) => e.project_module_id === m.pm.id);
      const recent = mine.filter((e) => new Date(e.created_at).getTime() > weekAgo).length;
      return {
        pmId: m.pm.id,
        key: m.def.key,
        label: (m.def.plural ?? m.name).toUpperCase(),
        count: mine.length,
        delta: recent,
      };
    });
});

export const getDashboardProjects = cache(async () => {
  const user = await getUser();
  const supabase = await createClient();
  const { data: mine } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user?.id ?? "00000000-0000-0000-0000-000000000000")
    .order("last_touched_at", { ascending: false });

  const { data: examples } = await supabase
    .from("projects")
    .select("*")
    .eq("is_example", true)
    .order("created_at");

  return { mine: mine ?? [], examples: examples ?? [], hasAny: (mine ?? []).length > 0 };
});

export const getGapContext = cache(async (projectId: string) => {
  const supabase = await createClient();
  const [modules, project, questions, dismissedRes, entriesRes] = await Promise.all([
    getProjectModules(projectId),
    getProject(projectId),
    getQuestions(projectId),
    supabase.from("gap_dismissals").select("gap_key").eq("project_id", projectId),
    supabase.from("entries").select("*").eq("project_id", projectId),
  ]);
  const entriesByPm = new Map<string, EntryRow[]>();
  for (const e of (entriesRes.data ?? []) as EntryRow[]) {
    const arr = entriesByPm.get(e.project_module_id) ?? [];
    arr.push(e);
    entriesByPm.set(e.project_module_id, arr);
  }
  return {
    modules,
    project,
    questions,
    entriesByPm,
    dismissed: new Set((dismissedRes.data ?? []).map((d) => d.gap_key)),
  };
});

export const getQuestionCounts = cache(async (projectId: string) => {
  const questions = await getQuestions(projectId);
  return {
    resolved: questions.filter((q) => q.status === "resolved").length,
    open: questions.filter((q) => q.status !== "resolved").length,
    exploring: questions.filter((q) => q.status === "exploring").length,
    blocking: questions.filter((q) => q.status !== "resolved" && q.priority === "blocking"),
  };
});
