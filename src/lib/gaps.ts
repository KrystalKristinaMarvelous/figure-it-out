import "server-only";

import type { EntryRow } from "@/lib/supabase/database.types";
import type { GapRule, FieldDef, EntryValues } from "@/lib/schema/types";
import type { ResolvedModule } from "@/lib/data";
import { isFieldEmpty, titleFor } from "@/lib/schema/values";

export interface Gap {
  key: string; // stable, for dismissal
  message: string;
  weight: number;
  moduleKey: string;
  action?: { label: string; href: string };
}

/** Tier 1 — structural, rule-based, no model. Deterministic, never wrong (spec §13.1). */
export function detectGaps(
  projectId: string,
  modules: ResolvedModule[],
  entriesByPm: Map<string, EntryRow[]>,
  questions: { id: string; text: string; status: string; created_at: string }[],
  dismissed: Set<string>,
): Gap[] {
  const gaps: Gap[] = [];

  for (const m of modules) {
    const entries = entriesByPm.get(m.pm.id) ?? [];
    const schema = m.def.entrySchema;
    const rules = m.def.gapRules ?? [];
    const href = `/projects/${projectId}/m/${m.pm.id}`;

    for (const rule of rules) {
      const found = applyRule(rule, schema, entries);
      for (const msg of found) {
        gaps.push({
          key: `${m.def.key}:${rule.type}:${rule.field ?? ""}:${msg.slice(0, 40)}`,
          message: msg,
          weight: rule.weight ?? 1,
          moduleKey: m.def.key,
          action: { label: "Take this to brainstorm", href: `/projects/${projectId}/brainstorm` },
        });
      }
    }

    // generic: a required field empty on any entry
    for (const f of schema.filter((s) => s.required && s.type !== "reference")) {
      for (const e of entries) {
        if (isFieldEmpty(f, (e.values as EntryValues)[f.key])) {
          gaps.push({
            key: `${m.def.key}:req:${f.key}:${e.id}`,
            message: `${e.title || titleFor(schema, e.values as EntryValues)} has no ${f.label.toLowerCase()}.`,
            weight: 2,
            moduleKey: m.def.key,
            action: { label: "Fill it in", href },
          });
        }
      }
    }
  }

  // stale questions (open > 30 days)
  const now = Date.now();
  for (const q of questions) {
    if (q.status === "resolved") continue;
    const age = Math.floor((now - new Date(q.created_at).getTime()) / 86_400_000);
    if (age > 30) {
      gaps.push({
        key: `question:stale:${q.id}`,
        message: `“${q.text}” has been open ${age} days.`,
        weight: 1,
        moduleKey: "open_questions",
        action: { label: "Still stuck on this?", href: `/projects/${projectId}/chaos` },
      });
    }
  }

  return gaps
    .filter((g) => !dismissed.has(g.key))
    .sort((a, b) => b.weight - a.weight);
}

function applyRule(rule: GapRule, schema: FieldDef[], entries: EntryRow[]): string[] {
  const out: string[] = [];
  const fill = (msg: string, title?: string) => msg.replace("{title}", title ?? "an entry");

  switch (rule.type) {
    case "no_entries":
      if (entries.length === 0) out.push(rule.message);
      break;
    case "min_entries":
      if (entries.length < (rule.min ?? 1)) out.push(rule.message);
      break;
    case "field_empty": {
      if (!rule.field) break;
      const f = schema.find((s) => s.key === rule.field);
      if (!f) break;
      for (const e of entries) {
        if (isFieldEmpty(f, (e.values as EntryValues)[rule.field])) {
          out.push(fill(rule.message, e.title ?? titleFor(schema, e.values as EntryValues)));
        }
      }
      break;
    }
    case "required_pairing": {
      if (!rule.field || !rule.pairWith) break;
      for (const e of entries) {
        const v = e.values as EntryValues;
        const a = schema.find((s) => s.key === rule.field);
        const b = schema.find((s) => s.key === rule.pairWith);
        if (a && b && !isFieldEmpty(a, v[rule.field]) && isFieldEmpty(b, v[rule.pairWith!])) {
          out.push(fill(rule.message, e.title ?? titleFor(schema, v)));
        }
      }
      break;
    }
    case "empty_slot": {
      const slotField = schema.find((s) => s.slot === "beat" || s.slot === "section" || s.slot === "part");
      if (!slotField?.options) break;
      const present = new Set(
        entries.map((e) => (e.values as EntryValues)[slotField.key] as string),
      );
      const missing = slotField.options.filter((o) => !present.has(o));
      if (missing.length) out.push(`${rule.message} (missing: ${missing.join(", ")})`);
      break;
    }
  }
  return out;
}

// ── Tier 1 contradictions (spec §13.2) — date/number arithmetic, never wrong ──
export interface Contradiction {
  message: string;
}

export function detectContradictions(
  modules: ResolvedModule[],
  entriesByPm: Map<string, EntryRow[]>,
  project: { target_type: string | null; target_value: number | null },
): Contradiction[] {
  const out: Contradiction[] = [];

  // chapter / section targets summing below the project target
  if (project.target_type === "words" && project.target_value) {
    for (const m of modules) {
      const wf = m.def.entrySchema.find(
        (f) => f.type === "number" && /word/i.test(f.key + f.label),
      );
      if (!wf) continue;
      const entries = entriesByPm.get(m.pm.id) ?? [];
      const sum = entries.reduce(
        (s, e) => s + (Number((e.values as EntryValues)[wf.key]) || 0),
        0,
      );
      if (sum > 0 && sum < project.target_value * 0.9) {
        out.push({
          message: `${m.name} targets sum to ${sum.toLocaleString()} words, below the project target of ${project.target_value.toLocaleString()}.`,
        });
      }
    }
  }

  // budget lines exceeding the budget
  if (project.target_type === "money" && project.target_value) {
    for (const m of modules) {
      const mf = m.def.entrySchema.find((f) => f.type === "money");
      if (!mf) continue;
      const entries = entriesByPm.get(m.pm.id) ?? [];
      const sum = entries.reduce(
        (s, e) => s + (Number((e.values as EntryValues)[mf.key]) || 0),
        0,
      );
      if (sum > project.target_value) {
        out.push({
          message: `${m.name} adds up to ${sum.toLocaleString()}, over the budget of ${project.target_value.toLocaleString()}.`,
        });
      }
    }
  }

  // overlapping bookings (start/end slots)
  for (const m of modules) {
    const sf = m.def.entrySchema.find((f) => f.slot === "start");
    const ef = m.def.entrySchema.find((f) => f.slot === "end");
    if (!sf || !ef) continue;
    const rows = (entriesByPm.get(m.pm.id) ?? [])
      .map((e) => ({
        title: e.title,
        s: new Date(String((e.values as EntryValues)[sf.key] ?? "")).getTime(),
        e: new Date(String((e.values as EntryValues)[ef.key] ?? "")).getTime(),
      }))
      .filter((r) => !Number.isNaN(r.s) && !Number.isNaN(r.e))
      .sort((a, b) => a.s - b.s);
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].s < rows[i - 1].e) {
        out.push({
          message: `"${rows[i - 1].title}" and "${rows[i].title}" overlap in ${m.name}.`,
        });
      }
    }
  }

  return out;
}
