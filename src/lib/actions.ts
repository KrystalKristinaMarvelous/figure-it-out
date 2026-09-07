"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireUser } from "@/lib/supabase/server";
import { getModuleDef } from "@/content/modules";
import { modulesForCreation } from "@/lib/schema/taxonomy";
import { coerceValues, titleFor } from "@/lib/schema/values";
import type { FieldDef } from "@/lib/schema/types";

async function assertOwnsProject(projectId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Not found");
  return { user, supabase };
}

// ── project creation (the two-axis wizard) ─────────────────────────────────
const CreateProject = z.object({
  category: z.string(),
  subtype: z.string(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  spec_tags: z.array(z.string()).default([]),
  readiness: z.enum(["seed", "vague", "defined"]),
  modules: z.array(z.string()).min(1),
  target_type: z.string().optional().nullable(),
  target_value: z.coerce.number().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export async function createProject(input: z.input<typeof CreateProject>) {
  const user = await requireUser();
  const supabase = await createClient();
  const p = CreateProject.parse(input);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: p.title,
      one_liner: p.description || null,
      original_one_liner: p.description || null,
      category: p.category,
      subtype: p.subtype,
      spec_tags: p.spec_tags,
      readiness: p.readiness,
      status: p.readiness === "defined" ? "building" : "seed",
      target_type: p.target_type || null,
      target_value: p.target_value ?? null,
      deadline: p.deadline || null,
    })
    .select("id")
    .single();
  if (error || !project) throw new Error(error?.message ?? "Could not create project");

  // resolve module keys → definition ids, insert project_modules
  const keys = Array.from(new Set(p.modules));
  const { data: defs } = await supabase
    .from("module_definitions")
    .select("id, key")
    .in("key", keys);
  const idByKey = new Map((defs ?? []).map((d) => [d.key, d.id]));

  const rows = keys
    .map((key, i) => {
      const id = idByKey.get(key);
      if (!id) return null;
      return {
        project_id: project.id,
        module_definition_id: id,
        order_index: i,
        status: "active" as const,
      };
    })
    .filter(Boolean) as Record<string, unknown>[];
  if (rows.length)
    await supabase.from("project_modules").insert(rows as never);

  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

// ── project updates ───────────────────────────────────────────────────────
export async function updateProjectField(
  projectId: string,
  patch: Partial<{
    title: string;
    one_liner: string;
    status: string;
    readiness: "seed" | "vague" | "defined";
    accent: string;
    target_type: string | null;
    target_value: number | null;
    deadline: string | null;
  }>,
) {
  const { supabase } = await assertOwnsProject(projectId);
  const clean: Record<string, unknown> = { ...patch };
  if (patch.one_liner !== undefined) {
    const { data } = await supabase
      .from("projects")
      .select("original_one_liner")
      .eq("id", projectId)
      .single();
    if (data && !data.original_one_liner && patch.one_liner) {
      clean.original_one_liner = patch.one_liner;
    }
  }
  await supabase.from("projects").update(clean as never).eq("id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function changeReadiness(projectId: string, readiness: "seed" | "vague" | "defined") {
  const { supabase } = await assertOwnsProject(projectId);
  const { data: project } = await supabase
    .from("projects")
    .select("category, subtype")
    .eq("id", projectId)
    .single();
  if (!project) return;

  // additive: add any modules the new readiness tier introduces, nothing removed
  const wanted = modulesForCreation(project.category, project.subtype, readiness);
  const { data: existing } = await supabase
    .from("project_modules")
    .select("module_definition_id, module_definitions(key), order_index")
    .eq("project_id", projectId);
  const haveKeys = new Set(
    (existing ?? []).map(
      (r) => (r as { module_definitions: { key: string } | null }).module_definitions?.key,
    ),
  );
  const missing = wanted.filter((k) => !haveKeys.has(k));
  if (missing.length) {
    const { data: defs } = await supabase
      .from("module_definitions")
      .select("id, key")
      .in("key", missing);
    let order = (existing ?? []).length;
    const rows = (defs ?? []).map((d) => ({
      project_id: projectId,
      module_definition_id: d.id,
      order_index: order++,
      status: "active" as const,
    }));
    if (rows.length) await supabase.from("project_modules").insert(rows);
  }

  await supabase.from("projects").update({ readiness }).eq("id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── modules ──────────────────────────────────────────────────────────────
export async function addModule(projectId: string, moduleKey: string) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data: def } = await supabase
    .from("module_definitions")
    .select("id")
    .eq("key", moduleKey)
    .is("author_id", null)
    .maybeSingle();
  if (!def) throw new Error("Unknown module");

  const { data: existing } = await supabase
    .from("project_modules")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("module_definition_id", def.id)
    .maybeSingle();

  if (existing) {
    // re-adding restores (spec §5.3)
    await supabase.from("project_modules").update({ status: "active" }).eq("id", existing.id);
  } else {
    const { count } = await supabase
      .from("project_modules")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    await supabase.from("project_modules").insert({
      project_id: projectId,
      module_definition_id: def.id,
      order_index: count ?? 0,
      status: "active",
    });
  }
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function archiveModuleByKey(projectId: string, moduleKey: string) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data } = await supabase
    .from("project_modules")
    .select("id, module_definitions(key)")
    .eq("project_id", projectId);
  const pm = (data ?? []).find(
    (r) => (r as { module_definitions: { key: string } | null }).module_definitions?.key === moduleKey,
  );
  if (pm) {
    await supabase.from("project_modules").update({ status: "archived" }).eq("id", pm.id);
    revalidatePath(`/projects/${projectId}`, "layout");
  }
}

export async function archiveModule(projectId: string, pmId: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase
    .from("project_modules")
    .update({ status: "archived" })
    .eq("id", pmId)
    .eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function reorderModules(projectId: string, orderedPmIds: string[]) {
  const { supabase } = await assertOwnsProject(projectId);
  await Promise.all(
    orderedPmIds.map((id, i) =>
      supabase.from("project_modules").update({ order_index: i }).eq("id", id).eq("project_id", projectId),
    ),
  );
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── entries ──────────────────────────────────────────────────────────────
async function schemaForPm(supabase: Awaited<ReturnType<typeof createClient>>, pmId: string) {
  const { data } = await supabase
    .from("project_modules")
    .select("project_id, module_definitions(key, entry_schema)")
    .eq("id", pmId)
    .single();
  const row = data as unknown as {
    project_id: string;
    module_definitions: { key: string; entry_schema: FieldDef[] } | null;
  } | null;
  const key = row?.module_definitions?.key;
  const def = key ? getModuleDef(key) : undefined;
  const schema = (def?.entrySchema ?? row?.module_definitions?.entry_schema ?? []) as FieldDef[];
  return { schema, projectId: row?.project_id ?? "" };
}

export async function createEntry(
  projectId: string,
  pmId: string,
  raw: Record<string, unknown>,
  opts?: { status?: string; derivedFromRantId?: string },
) {
  const { supabase } = await assertOwnsProject(projectId);
  const { schema } = await schemaForPm(supabase, pmId);
  const values = coerceValues(schema, raw);
  const { data: last } = await supabase
    .from("entries")
    .select("order_index")
    .eq("project_module_id", pmId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: entry } = await supabase
    .from("entries")
    .insert({
      project_id: projectId,
      project_module_id: pmId,
      title: titleFor(schema, values),
      values,
      status: opts?.status ?? null,
      order_index: (last?.order_index ?? -1) + 1,
    })
    .select("id")
    .single();

  if (entry && opts?.derivedFromRantId) {
    await supabase.from("links").insert({
      project_id: projectId,
      from_type: "entry",
      from_id: entry.id,
      to_type: "rant",
      to_id: opts.derivedFromRantId,
      relation: "derived_from",
    });
    await supabase.from("rants").update({ mined: true }).eq("id", opts.derivedFromRantId);
  }
  revalidatePath(`/projects/${projectId}`, "layout");
  return entry?.id ?? null;
}

export async function updateEntry(
  projectId: string,
  pmId: string,
  entryId: string,
  raw: Record<string, unknown>,
  status?: string,
) {
  const { supabase } = await assertOwnsProject(projectId);
  const { schema } = await schemaForPm(supabase, pmId);
  const values = coerceValues(schema, raw);
  await supabase
    .from("entries")
    .update({
      values,
      title: titleFor(schema, values),
      ...(status !== undefined ? { status } : {}),
    })
    .eq("id", entryId)
    .eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function setEntryStatus(projectId: string, entryId: string, status: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase.from("entries").update({ status }).eq("id", entryId).eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function deleteEntry(projectId: string, entryId: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase.from("entries").delete().eq("id", entryId).eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function reorderEntries(projectId: string, orderedIds: string[]) {
  const { supabase } = await assertOwnsProject(projectId);
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("entries").update({ order_index: i }).eq("id", id).eq("project_id", projectId),
    ),
  );
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── questions ────────────────────────────────────────────────────────────
export async function createQuestion(
  projectId: string,
  input: { text: string; priority?: "blocking" | "important" | "minor"; source?: string },
) {
  const { supabase } = await assertOwnsProject(projectId);
  if (!input.text.trim()) return;
  await supabase.from("questions").insert({
    project_id: projectId,
    text: input.text.trim(),
    priority: input.priority ?? "important",
    source: (input.source as "manual") ?? "manual",
  });
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function updateQuestion(
  projectId: string,
  questionId: string,
  patch: Partial<{ text: string; priority: string; status: string; answer: string }>,
) {
  const { supabase } = await assertOwnsProject(projectId);
  const clean: Record<string, unknown> = { ...patch };
  if (patch.status === "resolved") {
    clean.resolved_at = new Date().toISOString();
  } else if (patch.status && patch.status !== "resolved") {
    clean.resolved_at = null;
  }
  await supabase
    .from("questions")
    .update(clean as never)
    .eq("id", questionId)
    .eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function resolveQuestion(projectId: string, questionId: string, answer: string) {
  if (!answer.trim()) throw new Error("An answer is required to resolve a question.");
  await updateQuestion(projectId, questionId, { status: "resolved", answer: answer.trim() });
}

// ── rants ────────────────────────────────────────────────────────────────
export async function createRant(
  projectId: string,
  input: {
    mode?: "text" | "audio";
    body_text?: string;
    audio_url?: string;
    duration_ms?: number;
    mood?: string;
    tags?: string[];
  },
) {
  const { supabase } = await assertOwnsProject(projectId);
  if (!input.body_text?.trim() && !input.audio_url) return null;
  const { data } = await supabase
    .from("rants")
    .insert({
      project_id: projectId,
      mode: input.mode ?? (input.audio_url ? "audio" : "text"),
      body_text: input.body_text?.trim() || null,
      audio_url: input.audio_url || null,
      duration_ms: input.duration_ms ?? null,
      mood: input.mood || null,
      tags: input.tags ?? [],
      transcript_status: input.audio_url ? "queued" : "none",
    })
    .select("id")
    .single();
  revalidatePath(`/projects/${projectId}`, "layout");
  return data?.id ?? null;
}

// ── lifecycle ────────────────────────────────────────────────────────────
export async function shelveProject(projectId: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase
    .from("projects")
    .update({ lifecycle: "shelved", shelved_at: new Date().toISOString(), status: "dormant" })
    .eq("id", projectId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteProject(projectId: string, confirmTitle: string) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .single();
  if (!project) throw new Error("Not found");
  if (confirmTitle !== project.title) {
    throw new Error("The name doesn't match — deletion cancelled.");
  }
  await supabase.from("projects").delete().eq("id", projectId);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function reopenProject(projectId: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase
    .from("projects")
    .update({ lifecycle: "active", shelved_at: null, finished_at: null })
    .eq("id", projectId);
  await supabase.from("activity").insert({ project_id: projectId, kind: "project_reopened" });
  revalidatePath(`/projects/${projectId}`, "layout");
}

const Reflection = z.object({
  turned_out: z.string().optional(),
  surprised: z.string().optional(),
  differently: z.string().optional(),
  taught: z.string().optional(),
});

export async function finishProject(
  projectId: string,
  reflection: z.infer<typeof Reflection>,
) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data: project } = await supabase
    .from("projects")
    .select("completion_count")
    .eq("id", projectId)
    .single();
  await supabase
    .from("projects")
    .update({
      lifecycle: "finished",
      finished_at: new Date().toISOString(),
      status: "done",
      reflection: Reflection.parse(reflection),
      completion_count: (project?.completion_count ?? 0) + 1,
    })
    .eq("id", projectId);
  await supabase.from("activity").insert({ project_id: projectId, kind: "project_finished" });
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function addArtifact(
  projectId: string,
  input: { kind: "file" | "link"; file_url?: string; link_url?: string; title?: string; mime_type?: string },
) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data: project } = await supabase
    .from("projects")
    .select("completion_count")
    .eq("id", projectId)
    .single();
  await supabase.from("artifacts").insert({
    project_id: projectId,
    kind: input.kind,
    file_url: input.file_url ?? null,
    link_url: input.link_url ?? null,
    title: input.title ?? null,
    mime_type: input.mime_type ?? null,
    completion_index: project?.completion_count ?? 0,
  });
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── brainstorm ───────────────────────────────────────────────────────────
export async function startBrainstorm(
  projectId: string,
  topics: string[],
  seed?: { type: string; id?: string; text?: string },
) {
  const { supabase } = await assertOwnsProject(projectId);
  const { data } = await supabase
    .from("brainstorm_sessions")
    .insert({
      project_id: projectId,
      topics,
      seed_type: seed?.type ?? null,
      seed_id: seed?.id ?? null,
    })
    .select("id")
    .single();
  revalidatePath(`/projects/${projectId}`, "layout");
  if (data) redirect(`/projects/${projectId}/brainstorm/${data.id}`);
}

export async function saveBrainstormResponse(
  projectId: string,
  sessionId: string,
  input: { promptKey: string; promptText: string; answers: string[]; orderIndex: number },
) {
  const { supabase } = await assertOwnsProject(projectId);
  const answers = input.answers.map((a) => a.trim()).filter(Boolean);
  const dontKnow = input.answers.some((a) => a === "__dont_know__");

  const { data: existing } = await supabase
    .from("brainstorm_responses")
    .select("id")
    .eq("session_id", sessionId)
    .eq("prompt_key", input.promptKey)
    .maybeSingle();

  const payload = {
    session_id: sessionId,
    prompt_key: input.promptKey,
    prompt_text: input.promptText,
    answers,
    order_index: input.orderIndex,
  };
  if (existing) {
    await supabase.from("brainstorm_responses").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("brainstorm_responses").insert(payload);
  }

  if (dontKnow) {
    await supabase.from("questions").insert({
      project_id: projectId,
      text: input.promptText,
      source: "brainstorm",
      priority: "important",
    });
  }
  revalidatePath(`/projects/${projectId}/brainstorm/${sessionId}`);
}

export async function routeBrainstormAnswer(
  projectId: string,
  responseId: string,
  answer: string,
  disposition: "kept" | "discarded" | "sent",
  targetPmId?: string,
) {
  const { supabase } = await assertOwnsProject(projectId);

  if (disposition === "sent" && targetPmId) {
    const { schema } = await schemaForPm(supabase, targetPmId);
    const titleField = schema.find((f) => f.isTitle) ?? schema[0];
    const longField = schema.find((f) => f.type === "longtext");
    const raw: Record<string, unknown> = {};
    if (titleField) raw[titleField.key] = answer.slice(0, 120);
    if (longField && longField !== titleField) raw[longField.key] = answer;
    const entryId = await createEntry(projectId, targetPmId, raw);
    await supabase
      .from("brainstorm_responses")
      .update({ disposition: "sent", sent_to_entry_id: entryId })
      .eq("id", responseId);
  } else if (disposition === "kept") {
    // keep as a note in Ideas
    const { data: ideas } = await supabase
      .from("project_modules")
      .select("id, module_definitions(key)")
      .eq("project_id", projectId);
    const ideasPm = (ideas ?? []).find(
      (r) => (r as { module_definitions: { key: string } | null }).module_definitions?.key === "ideas",
    );
    if (ideasPm) await createEntry(projectId, ideasPm.id, { title: answer.slice(0, 120), detail: answer });
    await supabase.from("brainstorm_responses").update({ disposition: "kept" }).eq("id", responseId);
  } else {
    await supabase
      .from("brainstorm_responses")
      .update({ disposition: "discarded" })
      .eq("id", responseId);
  }
  revalidatePath(`/projects/${projectId}`, "layout");
}

export async function closeBrainstorm(projectId: string, sessionId: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase
    .from("brainstorm_sessions")
    .update({ status: "reviewed", completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("project_id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
  redirect(`/projects/${projectId}/brainstorm`);
}

export async function dismissGap(projectId: string, gapKey: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase
    .from("gap_dismissals")
    .upsert({ project_id: projectId, gap_key: gapKey }, { onConflict: "project_id,gap_key" });
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── chaos ────────────────────────────────────────────────────────────────
export async function chaosKeepAsQuestion(projectId: string, text: string) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase.from("questions").insert({
    project_id: projectId,
    text,
    source: "chaos",
    priority: "minor",
  });
  revalidatePath(`/projects/${projectId}`, "layout");
}

// ── quick capture from the dashboard ─────────────────────────────────────
export async function quickCapture(projectId: string, text: string) {
  if (!text.trim()) return;
  await createRant(projectId, { mode: "text", body_text: text });
}

// ── profile & preferences ────────────────────────────────────────────────
const ProfilePatch = z.object({
  display_name: z.string().trim().max(80).optional(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,30}$/, "3–30 chars, letters/numbers/underscore")
    .optional()
    .or(z.literal("")),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
});

export async function updateProfile(input: z.infer<typeof ProfilePatch>) {
  const user = await requireUser();
  const supabase = await createClient();
  const p = ProfilePatch.parse(input);
  const patch: Record<string, unknown> = { ...p };
  if (p.username === "") patch.username = null;

  const { error } = await supabase
    .from("profiles")
    .update(patch as never)
    .eq("id", user.id);
  if (error) {
    if (error.code === "23505") throw new Error("That username is taken.");
    throw new Error(error.message);
  }
  if (p.display_name) {
    await supabase.from("users").update({ display_name: p.display_name }).eq("id", user.id);
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard", "layout");
}

export async function toggleShowOnProfile(projectId: string, show: boolean) {
  const { supabase } = await assertOwnsProject(projectId);
  await supabase.from("projects").update({ show_on_profile: show }).eq("id", projectId);
  revalidatePath(`/projects/${projectId}`, "layout");
  revalidatePath("/me");
}

const PortfolioItem = z.object({
  title: z.string().trim().min(1).max(160),
  kind: z.string().trim().max(40).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("")),
  blurb: z.string().trim().max(400).optional(),
  link_url: z.string().trim().url().optional().or(z.literal("")),
});

export async function addPortfolioItem(input: z.input<typeof PortfolioItem>) {
  const user = await requireUser();
  const supabase = await createClient();
  const p = PortfolioItem.parse(input);
  await supabase.from("portfolio_items").insert({
    user_id: user.id,
    title: p.title,
    kind: p.kind || null,
    year: p.year === "" || p.year === undefined ? null : Number(p.year),
    blurb: p.blurb || null,
    link_url: p.link_url || null,
  });
  revalidatePath("/settings");
  revalidatePath("/me");
}

export async function deletePortfolioItem(id: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("portfolio_items").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/settings");
  revalidatePath("/me");
}

// ── social ───────────────────────────────────────────────────────────────
export async function follow(userId: string) {
  const user = await requireUser();
  if (userId === user.id) return;
  const supabase = await createClient();
  await supabase
    .from("follows")
    .upsert({ follower_id: user.id, following_id: userId }, { onConflict: "follower_id,following_id" });
  revalidatePath("/people");
  revalidatePath(`/u/${userId}`);
}

export async function unfollow(userId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);
  revalidatePath("/people");
  revalidatePath(`/u/${userId}`);
}

export async function sendMessage(recipientId: string, body: string) {
  const user = await requireUser();
  const text = body.trim();
  if (!text || recipientId === user.id) return;
  const supabase = await createClient();
  await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body: text.slice(0, 4000) });
  revalidatePath("/messages", "layout");
}

export async function markThreadRead(otherId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", otherId)
    .is("read_at", null);
  revalidatePath("/messages", "layout");
}

export async function saveThemePref(pref: { theme?: string; skin?: string }) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("settings").eq("id", user.id).single();
  const settings = { ...(data?.settings as Record<string, unknown> | null), ...pref };
  await supabase.from("users").update({ settings: settings as never }).eq("id", user.id);
}
