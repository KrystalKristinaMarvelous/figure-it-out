import type { Category, Readiness } from "./types";

/**
 * Axis 1 (what are you making) × Axis 2 (where are you with it).
 * The subtype decides WHICH modules load; readiness decides emphasis and which
 * of the subtype's module tiers are pre-checked.
 */

export interface SubtypeDef {
  key: string;
  label: string;
  /** suggested spec-tag chips (spec §3 step 3) */
  tags: string[];
  /** modules by readiness tier — each tier ADDS to the ones before it */
  modules: {
    seed: string[];
    vague: string[];
    defined: string[];
  };
  /** where the workspace lands after creation */
  landing: Partial<Record<Readiness, string>>;
  /** default target type for the Overview */
  target?: { type: string; label: string };
}

export interface CategoryDef {
  key: Category;
  label: string;
  icon: string; // lucide
  glyph: string; // decorative mark from spec §2.1
  blurb: string;
  subtypes: SubtypeDef[];
}

// Shorthand for module-key lists shared across many subtypes.
const CORE = ["rant_space", "open_questions"];
const IDEATE = [...CORE, "ideas", "inspiration", "sources"];
const SHAPE = ["notes", "decisions_log"];
const EXECUTE = ["tasks", "milestones", "people", "files_assets"];

export const TAXONOMY: CategoryDef[] = [
  {
    key: "creative",
    label: "Creative",
    icon: "Sparkles",
    glyph: "✦",
    blurb: "A novel, a comic, a game, a poetry collection, a world.",
    subtypes: [
      {
        key: "novel",
        label: "Novel",
        tags: ["fantasy", "literary", "YA", "mystery", "sci-fi", "romance", "horror"],
        modules: {
          seed: [...IDEATE, "themes_motifs"],
          vague: [
            ...IDEATE,
            ...SHAPE,
            "premise",
            "characters",
            "three_act",
            "places",
            "themes_motifs",
            "pov_voice",
          ],
          defined: [
            ...IDEATE,
            ...SHAPE,
            ...EXECUTE,
            "premise",
            "characters",
            "cast_overview",
            "relationship_map",
            "arc_tracker",
            "three_act",
            "chapter_plan",
            "scene_cards",
            "places",
            "history_timeline",
            "themes_motifs",
            "pov_voice",
            "style_sheet",
            "glossary",
          ],
        },
        landing: { seed: "rant_space", vague: "premise", defined: "three_act" },
        target: { type: "words", label: "Word count" },
      },
      {
        key: "short_story",
        label: "Short story",
        tags: ["literary", "speculative", "flash", "for submission"],
        modules: {
          seed: [...IDEATE],
          vague: [...IDEATE, ...SHAPE, "premise", "characters", "scene_cards", "themes_motifs"],
          defined: [...IDEATE, ...SHAPE, "tasks", "premise", "characters", "scene_cards", "three_act", "themes_motifs", "pov_voice", "style_sheet"],
        },
        landing: { seed: "rant_space", vague: "premise", defined: "scene_cards" },
        target: { type: "words", label: "Word count" },
      },
      {
        key: "screenplay",
        label: "Screenplay",
        tags: ["feature", "short", "pilot", "drama", "comedy"],
        modules: {
          seed: [...IDEATE],
          vague: [...IDEATE, ...SHAPE, "premise", "characters", "three_act", "themes_motifs"],
          defined: [...IDEATE, ...SHAPE, ...EXECUTE, "premise", "characters", "cast_overview", "three_act", "scene_cards", "pov_voice", "themes_motifs"],
        },
        landing: { seed: "rant_space", vague: "premise", defined: "three_act" },
        target: { type: "pages", label: "Page count" },
      },
      {
        key: "comic",
        label: "Comic",
        tags: ["webcomic", "graphic novel", "one-shot", "series"],
        modules: {
          seed: [...IDEATE],
          vague: [...IDEATE, ...SHAPE, "premise", "characters", "places", "three_act"],
          defined: [...IDEATE, ...SHAPE, ...EXECUTE, "premise", "characters", "cast_overview", "places", "three_act", "scene_cards", "themes_motifs"],
        },
        landing: { seed: "rant_space", vague: "premise", defined: "scene_cards" },
        target: { type: "pages", label: "Pages" },
      },
      {
        key: "game",
        label: "Game",
        tags: ["narrative", "roguelike", "puzzle", "tabletop", "solo dev"],
        modules: {
          seed: [...IDEATE],
          vague: [...IDEATE, ...SHAPE, "premise", "core_loop", "player_experience", "places"],
          defined: [...IDEATE, ...SHAPE, ...EXECUTE, "premise", "core_loop", "mechanics", "player_experience", "characters", "places", "themes_motifs"],
        },
        landing: { seed: "rant_space", vague: "core_loop", defined: "mechanics" },
      },
      {
        key: "worldbuilding",
        label: "Worldbuilding",
        tags: ["fantasy", "sci-fi", "alt-history", "for a novel", "for a game"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "ideas", "inspiration", "notes", "places", "cultures_peoples", "magic_tech_system", "history_timeline", "rules_of_world"],
          defined: [...CORE, "ideas", "inspiration", "notes", "decisions_log", "places", "cultures_peoples", "magic_tech_system", "history_timeline", "factions_power", "language_naming", "rules_of_world", "glossary"],
        },
        landing: { seed: "rant_space", vague: "places", defined: "history_timeline" },
      },
      {
        key: "poetry_collection",
        label: "Poetry collection",
        tags: ["chapbook", "full collection", "themed", "for submission"],
        modules: {
          seed: [...IDEATE, "themes_motifs"],
          vague: [...IDEATE, ...SHAPE, "poem_list", "themes_motifs", "image_bank"],
          defined: [...IDEATE, ...SHAPE, "tasks", "poem_list", "forms_constraints", "image_bank", "collection_order", "themes_motifs"],
        },
        landing: { seed: "rant_space", vague: "poem_list", defined: "collection_order" },
        target: { type: "pieces", label: "Poems" },
      },
    ],
  },
  {
    key: "academic",
    label: "Academic",
    icon: "GraduationCap",
    glyph: "🎓",
    blurb: "A research project, an essay, a dissertation, a science fair entry.",
    subtypes: [
      {
        key: "research_project",
        label: "Research project",
        tags: ["qualitative", "quantitative", "mixed methods", "lab", "field"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "ideas", "research_question", "literature_review", "methodology"],
          defined: [...CORE, "sources", "tasks", "milestones", "research_question", "literature_review", "methodology", "variables", "data_observations", "analysis", "supervisor_log"],
        },
        landing: { seed: "rant_space", vague: "research_question", defined: "methodology" },
      },
      {
        key: "essay",
        label: "Essay",
        tags: ["argumentative", "analytical", "for a grade", "for publication"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "argument_map", "essay_outline", "rubric_requirements"],
          defined: [...CORE, "sources", "tasks", "argument_map", "essay_outline", "citations", "rubric_requirements"],
        },
        landing: { seed: "rant_space", vague: "argument_map", defined: "essay_outline" },
        target: { type: "words", label: "Word count" },
      },
      {
        key: "presentation_ac",
        label: "Presentation",
        tags: ["lecture", "conference", "defense", "seminar"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "presentation", "argument_map"],
          defined: [...CORE, "sources", "tasks", "milestones", "presentation", "argument_map"],
        },
        landing: { seed: "rant_space", vague: "presentation", defined: "presentation" },
      },
      {
        key: "science_project",
        label: "Science project",
        tags: ["biology", "chemistry", "physics", "engineering", "fair entry", "class assignment"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "ideas", "research_question", "hypothesis", "variables", "methodology"],
          defined: [
            ...CORE,
            "sources",
            "tasks",
            "milestones",
            "research_question",
            "hypothesis",
            "variables",
            "methodology",
            "data_observations",
            "analysis",
            "science_writeup",
            "rubric_requirements",
          ],
        },
        landing: { seed: "rant_space", vague: "hypothesis", defined: "methodology" },
      },
      {
        key: "study_revision",
        label: "Study / revision",
        tags: ["exam prep", "final year", "GCSE", "A-level", "college"],
        modules: {
          seed: [...CORE, "ideas"],
          vague: [...CORE, "study_plan", "sources"],
          defined: [...CORE, "study_plan", "sources", "tasks", "milestones"],
        },
        landing: { seed: "rant_space", vague: "study_plan", defined: "study_plan" },
      },
      {
        key: "dissertation",
        label: "Dissertation",
        tags: ["masters", "PhD", "undergraduate", "empirical", "theoretical"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "research_question", "literature_review", "methodology", "argument_map"],
          defined: [...CORE, "sources", "tasks", "milestones", "research_question", "literature_review", "methodology", "variables", "data_observations", "analysis", "argument_map", "essay_outline", "citations", "supervisor_log"],
        },
        landing: { seed: "rant_space", vague: "research_question", defined: "essay_outline" },
        target: { type: "words", label: "Word count" },
      },
      {
        key: "coursework",
        label: "Coursework",
        tags: ["portfolio", "project brief", "group work", "graded"],
        modules: {
          seed: [...CORE, "ideas", "sources"],
          vague: [...CORE, "ideas", "sources", "rubric_requirements", "essay_outline"],
          defined: [...CORE, "sources", "tasks", "milestones", "rubric_requirements", "essay_outline", "citations"],
        },
        landing: { seed: "rant_space", vague: "rubric_requirements", defined: "tasks" },
      },
    ],
  },
  {
    key: "professional",
    label: "Professional",
    icon: "Briefcase",
    glyph: "💼",
    blurb: "A business idea, a campaign, a product, a launch, a report.",
    subtypes: [
      {
        key: "business_idea",
        label: "Business idea",
        tags: ["SaaS", "marketplace", "consumer", "B2B", "side project", "pre-seed"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "ideas", "problem_opportunity", "customer_audience", "value_proposition", "competitors"],
          defined: [...CORE, "tasks", "milestones", "problem_opportunity", "customer_audience", "value_proposition", "competitors", "business_model", "go_to_market", "risks_assumptions", "metrics"],
        },
        landing: { seed: "rant_space", vague: "problem_opportunity", defined: "business_model" },
      },
      {
        key: "research_pro",
        label: "Research",
        tags: ["market", "user", "competitive", "internal"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "research_question", "customer_audience", "competitors"],
          defined: [...CORE, "sources", "tasks", "research_question", "methodology", "data_observations", "analysis", "metrics"],
        },
        landing: { seed: "rant_space", vague: "research_question", defined: "analysis" },
      },
      {
        key: "presentation_pro",
        label: "Presentation",
        tags: ["pitch", "board update", "keynote", "sales", "internal"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "presentation", "ideas", "sources"],
          defined: [...CORE, "presentation", "tasks", "milestones", "stakeholders", "meeting_feedback_log"],
        },
        landing: { seed: "rant_space", vague: "presentation", defined: "presentation" },
      },
      {
        key: "campaign",
        label: "Campaign",
        tags: ["product launch", "awareness", "B2B", "rebrand", "seasonal", "fundraising"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "ideas", "inspiration", "campaign_brief", "campaign_audience", "competitors"],
          defined: [
            ...CORE,
            "inspiration",
            "tasks",
            "milestones",
            "budget",
            "people",
            "campaign_brief",
            "campaign_audience",
            "channel_plan",
            "content_calendar",
            "asset_list",
            "metrics_kpis",
          ],
        },
        landing: { seed: "rant_space", vague: "campaign_brief", defined: "content_calendar" },
        target: { type: "money", label: "Budget" },
      },
      {
        key: "product_project",
        label: "Product / project",
        tags: ["new feature", "v1", "internal tool", "redesign", "migration"],
        modules: {
          seed: [...CORE, "ideas"],
          vague: [...CORE, "ideas", "problem_opportunity", "customer_audience", "product_requirements"],
          defined: [...CORE, "tasks", "milestones", "people", "problem_opportunity", "product_requirements", "roadmap", "risks_assumptions", "metrics", "stakeholders", "meeting_feedback_log"],
        },
        landing: { seed: "rant_space", vague: "product_requirements", defined: "roadmap" },
      },
      {
        key: "event_launch",
        label: "Event / launch",
        tags: ["conference", "product launch", "webinar", "party", "internal"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "ideas", "event_brief", "run_of_show", "people"],
          defined: [...CORE, "tasks", "milestones", "budget", "people", "event_brief", "run_of_show", "vendors", "contingencies", "guest_list"],
        },
        landing: { seed: "rant_space", vague: "run_of_show", defined: "run_of_show" },
        target: { type: "date", label: "Event date" },
      },
      {
        key: "report",
        label: "Report",
        tags: ["quarterly", "research", "white paper", "post-mortem", "board"],
        modules: {
          seed: [...CORE, "sources", "ideas"],
          vague: [...CORE, "sources", "argument_map", "essay_outline"],
          defined: [...CORE, "sources", "tasks", "milestones", "argument_map", "essay_outline", "data_observations", "metrics"],
        },
        landing: { seed: "rant_space", vague: "argument_map", defined: "essay_outline" },
        target: { type: "words", label: "Word count" },
      },
    ],
  },
  {
    key: "personal",
    label: "Personal",
    icon: "Palette",
    glyph: "🎨",
    blurb: "A portfolio, a website, a trip, a renovation, a life project.",
    subtypes: [
      {
        key: "portfolio",
        label: "Portfolio",
        tags: ["design", "writing", "art", "developer", "for applications", "for clients"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "inspiration", "piece_list", "selection_criteria", "artist_statement"],
          defined: [...CORE, "tasks", "milestones", "piece_list", "selection_criteria", "portfolio_order", "artist_statement", "bio"],
        },
        landing: { seed: "rant_space", vague: "piece_list", defined: "portfolio_order" },
        target: { type: "pieces", label: "Pieces" },
      },
      {
        key: "personal_website",
        label: "Personal website",
        tags: ["portfolio site", "blog", "landing page", "resume site"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "inspiration", "sitemap", "page_content", "design_direction"],
          defined: [...CORE, "tasks", "milestones", "sitemap", "page_content", "design_direction", "tech_decisions"],
        },
        landing: { seed: "rant_space", vague: "sitemap", defined: "page_content" },
      },
      {
        key: "event_personal",
        label: "Event",
        tags: ["wedding", "birthday", "reunion", "dinner party", "fundraiser"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "ideas", "inspiration", "guest_list", "run_of_show", "budget"],
          defined: [...CORE, "tasks", "milestones", "budget", "guest_list", "run_of_show", "vendors", "contingencies"],
        },
        landing: { seed: "rant_space", vague: "guest_list", defined: "run_of_show" },
        target: { type: "date", label: "Event date" },
      },
      {
        key: "trip",
        label: "Trip",
        tags: ["solo", "family", "backpacking", "two weeks", "road trip", "work + leisure"],
        modules: {
          seed: [...CORE, "ideas", "inspiration", "budget_sketch"],
          vague: [...CORE, "ideas", "inspiration", "budget_sketch", "trip_places", "trip_itinerary"],
          defined: [
            ...CORE,
            "tasks",
            "trip_itinerary",
            "bookings",
            "trip_places",
            "budget",
            "packing_list",
            "travel_documents",
          ],
        },
        landing: { seed: "brainstorm", vague: "trip_places", defined: "trip_itinerary" },
        target: { type: "money", label: "Budget" },
      },
      {
        key: "life_project",
        label: "Life project",
        tags: ["habit", "big change", "creative practice", "health", "relationship"],
        modules: {
          seed: [...CORE, "ideas"],
          vague: [...CORE, "ideas", "life_goal", "milestones"],
          defined: [...CORE, "tasks", "milestones", "life_goal", "habits", "obstacles_support"],
        },
        landing: { seed: "rant_space", vague: "life_goal", defined: "milestones" },
      },
      {
        key: "home_renovation",
        label: "Home / renovation",
        tags: ["single room", "whole house", "DIY", "with contractors", "on a budget"],
        modules: {
          seed: [...CORE, "ideas", "inspiration"],
          vague: [...CORE, "inspiration", "rooms", "reno_decisions", "budget"],
          defined: [...CORE, "tasks", "milestones", "budget", "people", "rooms", "reno_decisions", "quotes_suppliers", "reno_sequence"],
        },
        landing: { seed: "rant_space", vague: "rooms", defined: "reno_sequence" },
        target: { type: "money", label: "Budget" },
      },
      {
        key: "learning_goal",
        label: "Learning goal",
        tags: ["a language", "an instrument", "a skill", "a certification", "self-taught"],
        modules: {
          seed: [...CORE, "ideas"],
          vague: [...CORE, "learning_syllabus", "sources", "checkpoints"],
          defined: [...CORE, "tasks", "milestones", "learning_syllabus", "sources", "practice_log", "checkpoints"],
        },
        landing: { seed: "rant_space", vague: "learning_syllabus", defined: "practice_log" },
      },
    ],
  },
  {
    key: "custom",
    label: "Custom",
    icon: "Settings2",
    glyph: "⚙️",
    blurb: "Build your own workspace. Starts with the essentials, opens the library.",
    subtypes: [
      {
        key: "custom",
        label: "Build your own workspace",
        tags: [],
        modules: { seed: [...CORE], vague: [...CORE], defined: [...CORE] },
        landing: { seed: "rant_space", vague: "rant_space", defined: "rant_space" },
      },
    ],
  },
];

export function findCategory(key: string) {
  return TAXONOMY.find((c) => c.key === key);
}

export function findSubtype(catKey: string, subKey: string) {
  return findCategory(catKey)?.subtypes.find((s) => s.key === subKey);
}

export function modulesForCreation(
  catKey: string,
  subKey: string,
  readiness: Readiness,
): string[] {
  const sub = findSubtype(catKey, subKey);
  if (!sub) return CORE;
  const list = sub.modules[readiness] ?? sub.modules.vague;
  return Array.from(new Set(list));
}

export const READINESS_META: Record<
  Readiness,
  { label: string; glyph: string; meaning: string; emphasis: string }
> = {
  seed: {
    label: "I just know I want to make one",
    glyph: "🌱",
    meaning: "You've chosen a domain, not a project.",
    emphasis: "Generate. Fewer modules, heavy prompting, rant and brainstorm front and centre.",
  },
  vague: {
    label: "I have a vague idea",
    glyph: "🌿",
    meaning: "There's a shape but it's a mess.",
    emphasis: "Shape. Structure modules first, gap detection on, open questions prominent.",
  },
  defined: {
    label: "I know what this is",
    glyph: "🌳",
    meaning: "You need to build and finish it.",
    emphasis: "Execute. Tasks, milestones and tracking first. Prompting light, contradiction checks on.",
  },
};
