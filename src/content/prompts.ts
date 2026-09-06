/**
 * Prompted Brainstorm library (spec §9.1). Stored as data. Small engineering,
 * large writing task. Each prompt belongs to a topic; topics vary by category.
 * `alternates` power the "Another angle →" button (static in v1).
 */

export interface PromptDef {
  key: string;
  topic: string;
  categories: string[]; // empty = all
  subtypes?: string[];
  question: string;
  hint?: string;
  alternates?: string[];
  order: number;
}

export interface TopicDef {
  key: string;
  label: string;
  categories: string[]; // which categories see this topic on the entry screen
  blurb: string;
}

export const BRAINSTORM_TOPICS: TopicDef[] = [
  { key: "character_motivation", label: "Character motivation", categories: ["creative"], blurb: "What a character wants, needs, and won't admit." },
  { key: "plot", label: "Plot & structure", categories: ["creative"], blurb: "What happens, and why it has to happen in that order." },
  { key: "world", label: "World & setting", categories: ["creative"], blurb: "The rules, the texture, the pressure the place puts on people." },
  { key: "theme", label: "Theme & meaning", categories: ["creative"], blurb: "What it's about underneath the events." },
  { key: "research_angle", label: "Research angle", categories: ["academic", "professional"], blurb: "The question you're actually asking." },
  { key: "counterarguments", label: "Counterarguments", categories: ["academic", "professional"], blurb: "The strongest case against your position." },
  { key: "method_alternatives", label: "Method alternatives", categories: ["academic"], blurb: "Other ways you could go about this." },
  { key: "customer_objections", label: "Customer objections", categories: ["professional"], blurb: "Why someone would say no." },
  { key: "failure_modes", label: "Failure modes", categories: ["professional"], blurb: "The ways this doesn't work out." },
  { key: "positioning", label: "Positioning", categories: ["professional"], blurb: "Why you, and not the alternative." },
  { key: "priorities", label: "Priorities", categories: ["personal"], blurb: "What matters most, and what you'll drop." },
  { key: "constraints", label: "Constraints", categories: ["personal"], blurb: "Money, time, people, energy — the real limits." },
  { key: "worth_doing", label: "What makes it worth doing", categories: ["personal"], blurb: "The reason that survives a bad week." },
  { key: "getting_started", label: "Getting started", categories: ["creative", "academic", "professional", "personal", "custom"], blurb: "You know the domain, not the project. Start here." },
];

// ── the prompts ─────────────────────────────────────────────────────────────
export const BRAINSTORM_PROMPTS: PromptDef[] = [
  // getting started (seed-state, all categories)
  { key: "gs_curious", topic: "getting_started", categories: [], order: 1,
    question: "What are you actually curious about here?",
    hint: "Not what would be impressive to make. What you keep thinking about.",
    alternates: ["What would you make if no one was going to see it?", "What's the itch?"] },
  { key: "gs_seen", topic: "getting_started", categories: [], order: 2,
    question: "What have you seen someone else do that you wanted to have done yourself?",
    alternates: ["Whose work makes you jealous, and of what exactly?"] },
  { key: "gs_bad", topic: "getting_started", categories: [], order: 3,
    question: "What's a version of this you know you don't want to make?",
    hint: "Ruling things out is progress." },
  { key: "gs_smallest", topic: "getting_started", categories: [], order: 4,
    question: "What's the smallest version of this that would still feel worth doing?" },
  { key: "gs_why_you", topic: "getting_started", categories: [], order: 5,
    question: "Why you? What do you bring to this that someone else wouldn't?" },

  // character motivation
  { key: "cm_want", topic: "character_motivation", categories: ["creative"], order: 1,
    question: "What do they want?",
    hint: "Concrete, external, statable in a sentence.",
    alternates: ["What would they say they want if you asked them at 3am?", "What do they want badly enough to embarrass themselves for?"] },
  { key: "cm_need", topic: "character_motivation", categories: ["creative"], order: 2,
    question: "What do they actually need — the thing that would help?",
    hint: "Usually not the same as what they want." },
  { key: "cm_lie", topic: "character_motivation", categories: ["creative"], order: 3,
    question: "What have they decided is true that isn't?",
    alternates: ["What would they have to admit for the story to end early?"] },
  { key: "cm_never", topic: "character_motivation", categories: ["creative"], order: 4,
    question: "What would they never do — and what would make them do it anyway?" },
  { key: "cm_cost", topic: "character_motivation", categories: ["creative"], order: 5,
    question: "What does the person closest to them cost them?" },

  // plot
  { key: "pl_wrong", topic: "plot", categories: ["creative"], order: 1,
    question: "What's the worst thing that could happen to this character, given what they want?",
    alternates: ["What are you protecting them from that you shouldn't?"] },
  { key: "pl_midpoint", topic: "plot", categories: ["creative"], order: 2,
    question: "Halfway through, what does the protagonist learn that changes the game?" },
  { key: "pl_noreturn", topic: "plot", categories: ["creative"], order: 3,
    question: "What's the point where they can't go back to their old life?" },
  { key: "pl_antag", topic: "plot", categories: ["creative"], order: 4,
    question: "What does the antagonist think they're doing? Make their case.",
    hint: "If they're just evil, the plot goes slack." },
  { key: "pl_subplot", topic: "plot", categories: ["creative"], order: 5,
    question: "Which secondary character's story rhymes with the main one?" },

  // world
  { key: "wd_rule", topic: "world", categories: ["creative"], order: 1,
    question: "What's one rule of this world that everyone in it takes for granted?" },
  { key: "wd_cost", topic: "world", categories: ["creative"], order: 2,
    question: "What does the central power / magic / technology cost the people who use it?" },
  { key: "wd_exception", topic: "world", categories: ["creative"], order: 3,
    question: "Where does that rule break, and who benefits from the exception?" },
  { key: "wd_ordinary", topic: "world", categories: ["creative"], order: 4,
    question: "What's an ordinary Tuesday like for someone with no part in the plot?" },

  // theme
  { key: "th_question", topic: "theme", categories: ["creative"], order: 1,
    question: "What question is the story asking that it doesn't answer?" },
  { key: "th_against", topic: "theme", categories: ["creative"], order: 2,
    question: "What's the strongest version of the position you disagree with?" },
  { key: "th_scene", topic: "theme", categories: ["creative"], order: 3,
    question: "Which single scene, if cut, would make the theme disappear?" },

  // research angle
  { key: "ra_sentence", topic: "research_angle", categories: ["academic", "professional"], order: 1,
    question: "What question are you actually asking, in one sentence?",
    hint: "No 'and'. No sub-clauses.",
    alternates: ["If you could only get one number, what would it be?"] },
  { key: "ra_close", topic: "research_angle", categories: ["academic", "professional"], order: 2,
    question: "Who has asked something close to this, and where did they stop?" },
  { key: "ra_interesting", topic: "research_angle", categories: ["academic", "professional"], order: 3,
    question: "What would have to be true for your answer to be interesting?" },
  { key: "ra_wrong", topic: "research_angle", categories: ["academic", "professional"], order: 4,
    question: "What result would prove you wrong?" },
  { key: "ra_measure", topic: "research_angle", categories: ["academic", "professional"], order: 5,
    question: "What can you measure with what you actually have access to?" },
  { key: "ra_half", topic: "research_angle", categories: ["academic", "professional"], order: 6,
    question: "If you got half the data you wanted, what could you still say?" },

  // counterarguments
  { key: "ca_best", topic: "counterarguments", categories: ["academic", "professional"], order: 1,
    question: "What's the best argument against your thesis?",
    hint: "Steelman it. A weak counterargument is worse than none." },
  { key: "ca_concede", topic: "counterarguments", categories: ["academic", "professional"], order: 2,
    question: "What would you have to concede is partly right?" },
  { key: "ca_evidence", topic: "counterarguments", categories: ["academic", "professional"], order: 3,
    question: "What evidence would a smart sceptic bring up first?" },

  // method alternatives
  { key: "ma_other", topic: "method_alternatives", categories: ["academic"], order: 1,
    question: "What's another method that could answer this question?" },
  { key: "ma_tradeoff", topic: "method_alternatives", categories: ["academic"], order: 2,
    question: "What does your chosen method buy you, and what does it cost you?" },
  { key: "ma_cheap", topic: "method_alternatives", categories: ["academic"], order: 3,
    question: "What's the cheapest thing you could do this week to test the approach?" },

  // customer objections
  { key: "co_no", topic: "customer_objections", categories: ["professional"], order: 1,
    question: "Why would someone who has this problem still say no?" },
  { key: "co_current", topic: "customer_objections", categories: ["professional"], order: 2,
    question: "What are they doing instead right now, and why is it good enough?" },
  { key: "co_switch", topic: "customer_objections", categories: ["professional"], order: 3,
    question: "What would switching cost them, beyond money?" },
  { key: "co_trust", topic: "customer_objections", categories: ["professional"], order: 4,
    question: "Why wouldn't they believe you can deliver this?" },

  // failure modes
  { key: "fm_sixmonths", topic: "failure_modes", categories: ["professional"], order: 1,
    question: "It's six months from now and this failed. What's the most likely reason?" },
  { key: "fm_assumption", topic: "failure_modes", categories: ["professional"], order: 2,
    question: "Which single assumption, if wrong, sinks the whole thing?" },
  { key: "fm_succeed", topic: "failure_modes", categories: ["professional"], order: 3,
    question: "What breaks if this succeeds faster than you expect?" },

  // positioning
  { key: "po_unlike", topic: "positioning", categories: ["professional"], order: 1,
    question: "Finish this: 'Unlike everyone else, we…'" },
  { key: "po_notfor", topic: "positioning", categories: ["professional"], order: 2,
    question: "Who is this deliberately not for?" },
  { key: "po_oneword", topic: "positioning", categories: ["professional"], order: 3,
    question: "If people described you in one word, what do you want it to be?" },

  // priorities
  { key: "pr_one", topic: "priorities", categories: ["personal"], order: 1,
    question: "If you could only get one thing right, what would it be?" },
  { key: "pr_drop", topic: "priorities", categories: ["personal"], order: 2,
    question: "What are you doing because it's expected rather than because it matters?" },
  { key: "pr_regret", topic: "priorities", categories: ["personal"], order: 3,
    question: "What would you most regret not doing?" },

  // constraints
  { key: "cn_real", topic: "constraints", categories: ["personal"], order: 1,
    question: "What's the real limit here — money, time, energy, or other people?" },
  { key: "cn_half", topic: "constraints", categories: ["personal"], order: 2,
    question: "What would you do if you had half the time?" },
  { key: "cn_double", topic: "constraints", categories: ["personal"], order: 3,
    question: "What would you do if money weren't a factor — and which bit of that can you keep anyway?" },

  // worth doing
  { key: "wo_badweek", topic: "worth_doing", categories: ["personal"], order: 1,
    question: "On a bad week, what's the reason you'd keep going?" },
  { key: "wo_afterwards", topic: "worth_doing", categories: ["personal"], order: 2,
    question: "When it's done, what do you want to be able to say about it?" },
  { key: "wo_forwhom", topic: "worth_doing", categories: ["personal"], order: 3,
    question: "Who is this for, really — including if the honest answer is 'me'?" },

  // event (subtype-scoped sample from spec §9.1)
  { key: "ev_for", topic: "priorities", categories: ["professional", "personal"], subtypes: ["event_launch", "event_personal"], order: 10,
    question: "Who is this event actually for?" },
  { key: "ev_saying", topic: "worth_doing", categories: ["professional", "personal"], subtypes: ["event_launch", "event_personal"], order: 11,
    question: "What do you want people saying afterwards?" },
  { key: "ev_wrong", topic: "failure_modes", categories: ["professional", "personal"], subtypes: ["event_launch", "event_personal"], order: 12,
    question: "What's the one thing that must not go wrong?" },
  { key: "ev_weather", topic: "constraints", categories: ["professional", "personal"], subtypes: ["event_launch", "event_personal"], order: 13,
    question: "What's your contingency if the weather turns?" },
];

export function topicsForCategory(category: string): TopicDef[] {
  return BRAINSTORM_TOPICS.filter((t) => t.categories.includes(category));
}

export function promptsForTopic(
  topic: string,
  category: string,
  subtype?: string,
): PromptDef[] {
  return BRAINSTORM_PROMPTS.filter((p) => {
    if (p.topic !== topic) return false;
    if (p.categories.length && !p.categories.includes(category)) return false;
    if (p.subtypes && subtype && !p.subtypes.includes(subtype)) return false;
    if (p.subtypes && !subtype) return false;
    return true;
  }).sort((a, b) => a.order - b.order);
}
