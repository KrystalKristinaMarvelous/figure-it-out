// Validates the migrations against an ephemeral Postgres (pglite).
// Supabase-provided schemas (auth, storage) are stubbed first.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const db = new PGlite();

const STUBS = `
create schema if not exists auth;
create schema if not exists storage;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb
);
create table storage.buckets (
  id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text, name text, owner uuid
);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text)
  returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
create or replace function auth.uid() returns uuid language sql stable as $$ select gen_random_uuid() $$;
`;

const dir = join(process.cwd(), "supabase", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

try {
  await db.exec(STUBS);
  for (const f of files) {
    let sql = readFileSync(join(dir, f), "utf8");
    // Supabase has these; pglite doesn't bundle them. gen_random_uuid is built in.
    sql = sql.replace(/create extension if not exists "[^"]+";/g, "");
    process.stdout.write(`→ ${f} … `);
    await db.exec(sql);
    console.log("ok");
  }
  const { rows: mods } = await db.query("select count(*)::int n from public.module_definitions");
  const { rows: prompts } = await db.query("select count(*)::int n from public.prompt_library");
  const { rows: chaos } = await db.query("select count(*)::int n from public.chaos_templates");
  const { rows: ex } = await db.query("select count(*)::int n from public.projects where is_example");
  const { rows: entries } = await db.query("select count(*)::int n from public.entries");
  console.log(`\nmodule_definitions: ${mods[0].n}`);
  console.log(`prompt_library:     ${prompts[0].n}`);
  console.log(`chaos_templates:    ${chaos[0].n}`);
  console.log(`example projects:   ${ex[0].n}`);
  console.log(`example entries:    ${entries[0].n}`);
  console.log("\n✓ all migrations apply cleanly");
} catch (e) {
  console.log("FAILED");
  console.error(e.message || e);
  process.exit(1);
}
