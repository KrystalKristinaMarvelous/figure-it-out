# FIO — *figure it out first*

A workspace for figuring out, planning, and tracking **any project** — creative,
academic, professional, or personal. Two choices at creation (*what are you
making* × *where are you with it*) assemble a workspace from pre-built,
opinionated modules. Nothing is built inside the app; you figure it out here,
build it elsewhere, and bring the finished thing back to your Portfolio.

Full product spec: [`specs/project-specification-final.md`](specs/project-specification-final.md).
Build status & what's done vs pending: [`BUILD_PLAN.md`](BUILD_PLAN.md).

## Stack
Next.js 16 (App Router, RSC, Turbopack) · React 19 · TypeScript · Tailwind v4 ·
Supabase (Postgres + Auth + Storage) · Whisper (optional) · Vercel.

## The engine
`projects → project_modules → entries → links` — four objects. Everything else is
a **service** over them (Capture, Prompting, Intelligence, Tracking) or a
**presentation** of them (sheet · slots · list · board · table · timeline ·
gallery · grid). Project types are templates: a named list of module keys plus
readiness weighting, defined in [`src/lib/schema/taxonomy.ts`](src/lib/schema/taxonomy.ts).

The value lives in the content, not the engine:
- **Modules** — `src/content/modules/` (~100 modules, craft-informed fields & prompts)
- **Brainstorm prompts** — `src/content/prompts.ts`
- **Chaos templates** — `src/content/chaos.ts`

`npm run gen:seed` compiles all three into a Supabase migration.

## Run it
See [`DEPLOY.md`](DEPLOY.md) for Supabase + Vercel. Locally:

```bash
cp .env.example .env.local     # fill in Supabase keys
npm install
npm run dev
```

## Scripts
| | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run gen:seed` | content registries → `supabase/migrations/*_seed_content.sql` |
| `npm run gen:types` | regenerate `database.types.ts` from a running local Supabase |
| `npm run db:reset` | apply migrations + seed to the local Supabase |
