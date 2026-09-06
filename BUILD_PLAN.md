# FIO — Build Progress

**App:** FIO ("Figure It Out") — a workspace for figuring out, planning, and tracking any project.
**Spec:** [specs/project-specification-final.md](specs/project-specification-final.md) (authoritative).
**Stack:** Next.js 16 (App Router, Turbopack, RSC) · React 19.2 · TypeScript · Tailwind v4 · Supabase · Vercel.
**Deploy:** build now, deploy later — see [DEPLOY.md](DEPLOY.md).

`[x]` done & wired · `[~]` partial / needs polish · `[ ]` not started

## Milestone 0 — Foundation
- [x] Next.js 16 scaffold, deps, Tailwind v4, `proxy.ts` session refresh
- [x] Design token system (globals.css) — light + dark, `unresolved` = the only accent
- [x] Typography split — serif (`.voice`) for the app's questions, sans for user structure
- [x] UI primitives — button, field set, card, badge, dialog, theme toggle
- [x] Supabase client / server / admin / proxy helpers + hand-authored `database.types.ts`
- [x] Full data model migration (17 tables) + triggers (updated_at, last_touched, tsvector, activity)
- [x] RLS on every table (owner-scoped via `owns_project`)
- [x] Storage buckets: `audio`, `artifacts`, `inspiration` (private, owner-scoped)
- [x] Seed migration — 102 modules, 57 brainstorm prompts, 72 chaos templates (`npm run gen:seed`)
- [x] Auth — signup / login / callback / signout, route gating
- [x] `.env.example`, `DEPLOY.md`, `README.md`

## Milestone 1 — Engine
- [x] Type system — `FieldDef` / `ModuleDef` / gap rules / entry values
- [x] Schema-driven form renderer — every field type incl. repeatable, checklist, reference, rating
- [x] Module registry (TS source of truth) → seed generator
- [x] Projects CRUD + server actions
- [x] project_modules add / archive / restore / reorder / readiness-additive
- [x] entries CRUD, JSONB coercion + validation, `derived_from` links
- [x] links model (used by triage + chaos link-avoidance)

## Milestone 2 — Creation & Dashboard
- [x] Dashboard — Active / Shelved / Portfolio tabs, project cards, deadline countdown
- [x] Empty state with example-project cards
- [x] Two-axis creation wizard — all 5 steps, "name it later", tag chips, module checklist
- [x] Module library browser — search, add / remove, cross-category modules
- [x] Quick Capture from dashboard + from the command palette

## Milestone 3 — Workspace surfaces
- [x] Project Overview — editable one-liner (+ "started as"), Pulse with weekly deltas, status/readiness, activity
- [x] Module presentations — sheet, slots→sheet, list, board (drag-free status moves), table, timeline (date-sorted), gallery/grid
- [x] Open Questions — all 5 sources, priority/status, resolve-with-answer, archive = decision history, reopen
- [x] Prompted Brainstorm — topic select, one-prompt-at-a-time, multi-answer, "I don't know yet" → question, "another angle", review & route
- [x] Chaos Mode — template random-walk from real entries, link-avoidance weighting, 5-card session, reroll/keep/brainstorm
- [x] Rant Space — text capture, stream, search, calendar heatmap, resurface, triage (send span → module + `derived_from`)
- [x] Rant Space — audio record (MediaRecorder) → Storage → Whisper transcription route with glossary vocab hint
- [x] Tier 1 gap detection (`src/lib/gaps.ts`) + Tier 1 contradictions (date/number arithmetic)
- [x] Completion flow — finish, artifact link, reflection prompts, shelve, reopen
- [x] Portfolio view — grid of finished work, original vs final one-liner, lifetime stats, set-aside section
- [x] Tasks & Milestones — via the universal modules (board / timeline presentations)

### Milestone 3 — remaining polish
- [x] Command palette (⌘K) + global capture hotkey (⌘⇧Space)
- [x] Gap findings surfaced on module pages & Overview (dismissible)
- [x] Markdown / JSON export (`/projects/[id]/export`)
- [x] Seed example projects — 3, read-only, on the dashboard empty state
- [ ] Dedicated full-text search UI across entries/rants/questions (tsvectors exist)
- [ ] Milestone "requires entries" completion logic
- [ ] Chaos templates 72 → 100+ ; brainstorm follow-up branching rules
- [ ] Craft pass on lighter-depth module sets (non-flagship subtypes)

## Content at launch
- [x] Universal set (14) · Creative/Novel (full) · Academic/Science project (full) · Professional/Campaign (full) · Personal/Trip (full) · Custom
- [x] Broader library authored for all ~30 subtypes (some at lighter depth — flagged for a craft pass)
- [~] Brainstorm prompts — core topic sets done; more per-subtype variants to add
- [~] Chaos templates — 72 of the 100+ target

## Deferred (Phase 2+, per spec §20)
Freeform Canvas (tldraw) · Tier 2 semantic AI (gaps, contradictions, Ask Project) · generated provocations · rant recurrence · custom modules · public portfolio pages · PDF/DOCX export · secondary-world calendars · offline PWA

## Deployed & verified live
- **Live:** https://figure-it-out-two.vercel.app · Supabase project `jntbqzcjtamwpfqsumec` · Vercel `figure-it-out`
- All 6 migrations applied to the hosted DB (102 modules / 57 prompts / 72 chaos / 3 example projects).
- Auth: email confirmation OFF (autoconfirm), site URL + redirect allow-list set.
- End-to-end verified on the live stack: signup → `handle_new_user` trigger → dashboard →
  wizard render; project + project_module insert under RLS; `log_activity` trigger fires.
- `npm run typecheck` / `build` / `validate:sql` all clean.

### Deploy gotchas hit (fixed)
- Supabase→Vercel integration created `NEXT_PUBLIC_SUPABASE_*` as **Sensitive** vars →
  undefined at build time → every route 500'd. Recreated as encrypted; `src/lib/supabase/env.ts`
  now also accepts the integration's `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` names.
- `proxy.ts` + `getUser()` hardened to fail soft instead of 500 when config is missing.
