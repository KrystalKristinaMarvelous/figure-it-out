/**
 * Chaos Mode templates (spec §14). Every card is a template filled from
 * randomly selected things the user actually wrote — so it cannot hallucinate.
 * Selection weights toward pairs with no existing link.
 *
 * Slot pools:
 *   entry    any entry, any module
 *   person   characters · people · guest list · cast
 *   place    places · trip places · rooms
 *   event    timeline · milestones · run of show · itinerary · calendar
 *   question an open question
 *   rant     a rant (or its transcript)
 *   idea     an entry from Ideas / Notes / Inspiration
 */

export interface ChaosTemplateDef {
  template: string;
  categories: string[]; // empty = all
  slots: { name: string; from: "entry" | "person" | "place" | "event" | "question" | "rant" | "idea" }[];
  weight?: number;
}

const S = (from: ChaosTemplateDef["slots"][number]["from"], ...names: string[]) =>
  names.map((name) => ({ name, from }));

export const CHAOS_TEMPLATES: ChaosTemplateDef[] = [
  // ── universal recombination ───────────────────────────────────────────
  { template: "What if {A} is wrong about {B}?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "How could {X} and {Y} be connected?", categories: [], slots: [...S("entry", "X", "Y")], weight: 1.4 },
  { template: "Remove {A}. What breaks?", categories: [], slots: [...S("entry", "A")] },
  { template: "Which of these is wrong: {A} or {B}?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "What if {A} and {B} swapped places?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "What does {A} have in common with {B} that you haven't noticed?", categories: [], slots: [...S("entry", "A", "B")], weight: 1.3 },
  { template: "If you could only keep one — {A} or {B} — which goes?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "What if {A} came first, before {B}?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "Explain {A} to someone who only knows about {B}.", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "What's the strongest argument that {A} doesn't belong in this project?", categories: [], slots: [...S("entry", "A")] },
  { template: "What would you have to add to make {A} matter twice as much?", categories: [], slots: [...S("entry", "A")] },
  { template: "What if {A} were the whole project and everything else was cut?", categories: [], slots: [...S("entry", "A")] },
  { template: "Who or what is missing between {A} and {B}?", categories: [], slots: [...S("entry", "A", "B")], weight: 1.3 },
  { template: "What assumption do {A} and {B} both depend on?", categories: [], slots: [...S("entry", "A", "B")] },
  { template: "What if the opposite of {A} were true?", categories: [], slots: [...S("entry", "A")] },
  { template: "What would {A} look like if you were embarrassed by it?", categories: [], slots: [...S("entry", "A")] },
  { template: "What's the boring version of {A}? The reckless version?", categories: [], slots: [...S("entry", "A")] },

  // ── questions ─────────────────────────────────────────────────────────
  { template: "What would happen if you just decided {Q} — picked an answer and moved on?", categories: [], slots: [...S("question", "Q")], weight: 1.2 },
  { template: "Who would know the answer to {Q}?", categories: [], slots: [...S("question", "Q")] },
  { template: "What if {Q} doesn't actually matter?", categories: [], slots: [...S("question", "Q")] },
  { template: "How does {A} change if the answer to {Q} is 'no'?", categories: [], slots: [...S("entry", "A"), ...S("question", "Q")], weight: 1.3 },
  { template: "What smaller question is hiding inside {Q}?", categories: [], slots: [...S("question", "Q")] },
  { template: "What would {P} say about {Q}?", categories: [], slots: [...S("person", "P"), ...S("question", "Q")] },

  // ── rants ────────────────────────────────────────────────────────────
  { template: "You wrote this a while ago: it's still unresolved. Is {R} still true?", categories: [], slots: [...S("rant", "R")] },
  { template: "What in {R} did you talk yourself out of?", categories: [], slots: [...S("rant", "R")] },
  { template: "Turn the throwaway line in {R} into the main idea.", categories: [], slots: [...S("rant", "R")], weight: 1.2 },

  // ── ideas / inspiration ──────────────────────────────────────────────
  { template: "What if {I} weren't a nice-to-have but the core?", categories: [], slots: [...S("idea", "I")] },
  { template: "Combine {I} with {A}. What is that?", categories: [], slots: [...S("idea", "I"), ...S("entry", "A")], weight: 1.3 },

  // ── creative ─────────────────────────────────────────────────────────
  { template: "Who benefits most if {A} goes wrong?", categories: ["creative"], slots: [...S("entry", "A")] },
  { template: "What does {P} want that you haven't written down?", categories: ["creative"], slots: [...S("person", "P")], weight: 1.3 },
  { template: "What would {P} do if they knew {Q}?", categories: ["creative"], slots: [...S("person", "P"), ...S("question", "Q")] },
  { template: "What if {P} is lying about {A}?", categories: ["creative"], slots: [...S("person", "P"), ...S("entry", "A")] },
  { template: "What if {E} happened five years earlier?", categories: ["creative"], slots: [...S("event", "E")] },
  { template: "What if {E} never happened at all?", categories: ["creative"], slots: [...S("event", "E")] },
  { template: "Put {P} in {PL} on the worst possible day. What happens?", categories: ["creative"], slots: [...S("person", "P"), ...S("place", "PL")], weight: 1.2 },
  { template: "What secret would blow up the relationship between {P} and {P2}?", categories: ["creative"], slots: [...S("person", "P"), ...S("person", "P2")] },
  { template: "Give {P} exactly what they want in chapter one. Now what's the book?", categories: ["creative"], slots: [...S("person", "P")] },
  { template: "What does {PL} look like to someone who grew up there versus someone just arriving?", categories: ["creative"], slots: [...S("place", "PL")] },
  { template: "What if {P} were the narrator?", categories: ["creative"], slots: [...S("person", "P")] },
  { template: "Which character would {P} become if they lost everything?", categories: ["creative"], slots: [...S("person", "P")] },
  { template: "What rule of the world would {A} break if it could?", categories: ["creative"], slots: [...S("entry", "A")] },
  { template: "What's the scene you're avoiding writing about {P}?", categories: ["creative"], slots: [...S("person", "P")] },
  { template: "What if {A} is a metaphor for the thing you won't say directly?", categories: ["creative"], slots: [...S("entry", "A")] },
  { template: "Who in the story would find {A} funny? Why?", categories: ["creative"], slots: [...S("entry", "A")] },

  // ── academic ─────────────────────────────────────────────────────────
  { template: "What if your result on {A} came out the opposite way — could you explain it?", categories: ["academic"], slots: [...S("entry", "A")] },
  { template: "Which reviewer would object to {A} first, and what would they say?", categories: ["academic"], slots: [...S("entry", "A")] },
  { template: "What would you have to measure to connect {A} and {B}?", categories: ["academic"], slots: [...S("entry", "A", "B")], weight: 1.3 },
  { template: "If {A} is a confound, how do you rule it out?", categories: ["academic"], slots: [...S("entry", "A")] },
  { template: "What's the version of {Q} you could answer in a weekend?", categories: ["academic"], slots: [...S("question", "Q")] },
  { template: "Whose prior work makes {A} unnecessary — and are they right?", categories: ["academic"], slots: [...S("entry", "A")] },
  { template: "What would a null result for {A} still tell you?", categories: ["academic"], slots: [...S("entry", "A")] },
  { template: "How would you explain {A} to a first-year? Where does the explanation break?", categories: ["academic"], slots: [...S("entry", "A")] },

  // ── professional ────────────────────────────────────────────────────
  { template: "What if your audience already tried {A} and it failed?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "Who benefits most if {A} never ships?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "A competitor copies {A} tomorrow. What's your next move?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "What would make {P} champion this internally? What would make them kill it?", categories: ["professional"], slots: [...S("person", "P")] },
  { template: "Cut the budget for {A} to zero. What do you do instead?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "What if {A} and {B} are actually the same initiative?", categories: ["professional"], slots: [...S("entry", "A", "B")], weight: 1.3 },
  { template: "What does {A} assume about the customer that might not be true?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "If {E} slipped by a month, what's the knock-on?", categories: ["professional"], slots: [...S("event", "E")] },
  { template: "What's the cheapest experiment that would tell you {A} is wrong?", categories: ["professional"], slots: [...S("entry", "A")] },
  { template: "Which metric would make {A} look good but the business worse?", categories: ["professional"], slots: [...S("entry", "A")] },

  // ── personal ────────────────────────────────────────────────────────
  { template: "What if you had three days instead of ten?", categories: ["personal"], slots: [] },
  { template: "What if you had to do {A} with no money?", categories: ["personal"], slots: [...S("entry", "A")] },
  { template: "Drop {A} entirely. Does the project still work?", categories: ["personal"], slots: [...S("entry", "A")] },
  { template: "What would make {PL} not worth the trip / the trouble?", categories: ["personal"], slots: [...S("place", "PL")] },
  { template: "If {E} fell through, what's plan B?", categories: ["personal"], slots: [...S("event", "E")] },
  { template: "Who would you regret not involving in {A}?", categories: ["personal"], slots: [...S("entry", "A")] },
  { template: "What's the part of {A} you're secretly dreading?", categories: ["personal"], slots: [...S("entry", "A")] },
  { template: "What would 'good enough' look like for {A}?", categories: ["personal"], slots: [...S("entry", "A")] },
  { template: "If you could only visit {PL} or {PL2}, which and why?", categories: ["personal"], slots: [...S("place", "PL", "PL2")] },
  { template: "What would you do differently about {A} if no one would ever see it?", categories: ["personal"], slots: [...S("entry", "A")] },
];
