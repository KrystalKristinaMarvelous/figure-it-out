import "server-only";

import { CHAOS_TEMPLATES, type ChaosTemplateDef } from "@/content/chaos";
import { shuffle } from "@/lib/utils";

type Pool = "entry" | "person" | "place" | "event" | "question" | "rant" | "idea";

const POOL_MODULES: Record<Exclude<Pool, "entry" | "question" | "rant">, string[]> = {
  person: ["characters", "people", "cast_overview", "guest_list", "campaign_audience"],
  place: ["places", "trip_places", "rooms"],
  event: [
    "history_timeline",
    "milestones",
    "run_of_show",
    "trip_itinerary",
    "content_calendar",
    "roadmap",
  ],
  idea: ["ideas", "notes", "inspiration"],
};

export interface ChaosItem {
  id: string; // pool + entity id
  label: string;
  moduleKey: string | null;
}

export interface ChaosCard {
  id: string;
  text: string;
  usedIds: string[];
}

export function generateChaosCards(
  category: string,
  entries: { id: string; title: string | null; moduleKey: string | null }[],
  questions: { id: string; text: string }[],
  rants: { id: string; body_text: string | null; transcript: string | null }[],
  existingLinks: { a: string; b: string }[],
  count = 5,
  seed = Math.random(),
): ChaosCard[] {
  const pool = (p: Pool): ChaosItem[] => {
    if (p === "question")
      return questions.map((q) => ({ id: `question:${q.id}`, label: `“${q.text}”`, moduleKey: "open_questions" }));
    if (p === "rant")
      return rants.map((r) => ({
        id: `rant:${r.id}`,
        label: `a rant (“${(r.body_text ?? r.transcript ?? "").slice(0, 40)}…”)`,
        moduleKey: "rant_space",
      }));
    if (p === "entry")
      return entries.map((e) => ({ id: `entry:${e.id}`, label: e.title || "an entry", moduleKey: e.moduleKey }));
    const mods = POOL_MODULES[p];
    return entries
      .filter((e) => e.moduleKey && mods.includes(e.moduleKey))
      .map((e) => ({ id: `entry:${e.id}`, label: e.title || "an entry", moduleKey: e.moduleKey }));
  };

  const linkSet = new Set(existingLinks.flatMap((l) => [`${l.a}|${l.b}`, `${l.b}|${l.a}`]));

  const usable = CHAOS_TEMPLATES.filter(
    (t) => (!t.categories.length || t.categories.includes(category)),
  );

  const cards: ChaosCard[] = [];
  const tries = shuffle(usable, seed);
  for (const tmpl of tries) {
    if (cards.length >= count) break;
    const card = fill(tmpl, pool, linkSet, seed + cards.length);
    if (card) cards.push(card);
  }
  return cards;
}

function fill(
  tmpl: ChaosTemplateDef,
  pool: (p: Pool) => ChaosItem[],
  linkSet: Set<string>,
  seed: number,
): ChaosCard | null {
  const chosen: Record<string, ChaosItem> = {};
  const used: string[] = [];
  for (const slot of tmpl.slots) {
    const options = shuffle(
      pool(slot.from).filter((o) => !used.includes(o.id)),
      seed,
    );
    if (!options.length) return null;
    // prefer entities with no existing link to already-picked ones
    const preferred =
      options.find((o) => used.every((u) => !linkSet.has(`${u}|${o.id}`))) ?? options[0];
    chosen[slot.name] = preferred;
    used.push(preferred.id);
  }
  const text = tmpl.template.replace(/\{(\w+)\}/g, (_, k) => chosen[k]?.label ?? `{${k}}`);
  return { id: `${tmpl.template}:${used.join(",")}`, text, usedIds: used };
}
