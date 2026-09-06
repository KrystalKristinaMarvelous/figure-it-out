/**
 * Hand-authored to match supabase/migrations. Regenerate with
 * `npm run gen:types` once a local Supabase is running for the fully-precise
 * version; this covers every table and the columns the app touches.
 */
type Json = string | number | boolean | null | { [k: string]: Json } | Json[];
type Ts = string;

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
type Table<Row, Rels extends Rel[] = [], Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rels;
};
type FK<C extends string, T extends string> = {
  foreignKeyName: `${string}`;
  columns: [C];
  isOneToOne: false;
  referencedRelation: T;
  referencedColumns: ["id"];
};

export type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  settings: Json;
  created_at: Ts;
}

export type ProjectRow = {
  id: string;
  user_id: string;
  title: string;
  one_liner: string | null;
  original_one_liner: string | null;
  category: string;
  subtype: string;
  spec_tags: string[];
  readiness: "seed" | "vague" | "defined";
  status: string;
  lifecycle: "active" | "shelved" | "finished";
  accent: string | null;
  target_type: string | null;
  target_value: number | null;
  deadline: string | null;
  finished_at: Ts | null;
  shelved_at: Ts | null;
  reflection: Json | null;
  completion_count: number;
  is_example: boolean;
  created_at: Ts;
  updated_at: Ts;
  last_touched_at: Ts;
}

export type ModuleDefinitionRow = {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  presentation: string;
  intro: string | null;
  entry_schema: Json;
  gap_rules: Json;
  category_affinity: string[];
  suggested_with: string[];
  is_universal: boolean;
  author_id: string | null;
  is_public: boolean;
  version: number;
  created_at: Ts;
}

export type ProjectModuleRow = {
  id: string;
  project_id: string;
  module_definition_id: string;
  custom_name: string | null;
  order_index: number;
  status: "active" | "archived";
  config: Json;
  created_at: Ts;
}

export type EntryRow = {
  id: string;
  project_id: string;
  project_module_id: string;
  title: string | null;
  values: Record<string, unknown>;
  status: string | null;
  order_index: number;
  created_at: Ts;
  updated_at: Ts;
}

export type RantRow = {
  id: string;
  project_id: string;
  mode: "text" | "audio";
  body_text: string | null;
  audio_url: string | null;
  transcript: string | null;
  transcript_status: "none" | "queued" | "processing" | "done" | "failed";
  duration_ms: number | null;
  mood: string | null;
  tags: string[];
  mined: boolean;
  created_at: Ts;
}

export type QuestionRow = {
  id: string;
  project_id: string;
  text: string;
  priority: "blocking" | "important" | "minor";
  status: "open" | "exploring" | "resolved";
  answer: string | null;
  resolved_to_entry_id: string | null;
  source: "brainstorm" | "gap" | "chaos" | "rant" | "manual";
  created_at: Ts;
  resolved_at: Ts | null;
}

export type LinkRow = {
  id: string;
  project_id: string;
  from_type: string;
  from_id: string;
  to_type: string;
  to_id: string;
  relation: "derived_from" | "references" | "related" | "blocks";
  meta: Json;
  created_at: Ts;
}

export type BrainstormSessionRow = {
  id: string;
  project_id: string;
  topics: string[];
  seed_type: string | null;
  seed_id: string | null;
  status: "open" | "reviewed";
  created_at: Ts;
  completed_at: Ts | null;
}

export type BrainstormResponseRow = {
  id: string;
  session_id: string;
  prompt_key: string | null;
  prompt_text: string;
  answers: Json;
  starred_index: number | null;
  disposition: "pending" | "sent" | "kept" | "discarded";
  sent_to_entry_id: string | null;
  order_index: number;
  created_at: Ts;
}

export type PromptLibraryRow = {
  id: string;
  key: string;
  topic: string;
  categories: string[];
  subtypes: string[];
  question: string;
  hint: string | null;
  alternates: Json;
  followup_rules: Json;
  order_index: number;
}

export type ChaosTemplateRow = {
  id: string;
  template: string;
  categories: string[];
  slot_spec: Json;
  weight: number;
}

export type ActivityRow = {
  id: string;
  project_id: string;
  kind: string;
  subject_type: string | null;
  subject_id: string | null;
  meta: Json;
  created_at: Ts;
}

export type ArtifactRow = {
  id: string;
  project_id: string;
  kind: "file" | "link";
  file_url: string | null;
  link_url: string | null;
  mime_type: string | null;
  title: string | null;
  caption: string | null;
  is_cover: boolean;
  order_index: number;
  completion_index: number;
  created_at: Ts;
}

export type GapDismissalRow = {
  id: string;
  project_id: string;
  gap_key: string;
  dismissed_at: Ts;
}

export type CanvasRow = {
  id: string;
  project_id: string;
  name: string;
  document: Json;
  created_at: Ts;
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.0";
  };
  public: {
    Tables: {
      users: Table<UserRow>;
      projects: Table<ProjectRow>;
      module_definitions: Table<ModuleDefinitionRow>;
      project_modules: Table<
        ProjectModuleRow,
        [FK<"module_definition_id", "module_definitions">, FK<"project_id", "projects">]
      >;
      entries: Table<
        EntryRow,
        [FK<"project_module_id", "project_modules">, FK<"project_id", "projects">]
      >;
      rants: Table<RantRow>;
      questions: Table<QuestionRow>;
      links: Table<LinkRow>;
      brainstorm_sessions: Table<BrainstormSessionRow>;
      brainstorm_responses: Table<BrainstormResponseRow>;
      prompt_library: Table<PromptLibraryRow>;
      chaos_templates: Table<ChaosTemplateRow>;
      activity: Table<ActivityRow>;
      artifacts: Table<ArtifactRow>;
      gap_dismissals: Table<GapDismissalRow>;
      canvases: Table<CanvasRow>;
    };
    Views: Record<string, never>;
    Functions: {
      project_question_counts: {
        Args: { p: string };
        Returns: { resolved: number; open: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
