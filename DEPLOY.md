# Deploying FIO — Supabase + Vercel

Two services: **Supabase** (Postgres, Auth, Storage) and **Vercel** (the Next.js app).
Do Supabase first — Vercel needs its keys.

---

## 1. Supabase

### 1a. Create the project
1. Go to <https://supabase.com/dashboard> → **New project**. Pick a name, a strong DB password, a region near your users.
2. Wait for it to provision (~2 min).

### 1b. Link the CLI and push the schema
The migrations in `supabase/migrations/` create every table, RLS policy, storage
bucket, and seed all module / prompt / chaos content.

```bash
# one-time: log in
npx supabase login

# link this repo to your project (find the ref in the dashboard URL or Settings → General)
npx supabase link --project-ref YOUR_PROJECT_REF

# push all migrations
npx supabase db push
```

If `db push` reports the seed is large, that's expected (~100 modules).

> Prefer the dashboard? Open **SQL Editor** and run each file in
> `supabase/migrations/` in filename order.

### 1c. Auth settings
**Authentication → URL Configuration**
- **Site URL:** `https://YOUR-VERCEL-DOMAIN.vercel.app`
- **Redirect URLs:** add `https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback`

**Authentication → Providers → Email:** enabled. For the smoothest first run,
turn **Confirm email** off (or configure SMTP under Project Settings → Auth).

### 1d. Grab the keys
**Project Settings → API**:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

### 1e. Storage
The migration creates three **private** buckets: `audio`, `artifacts`,
`inspiration`, each with owner-scoped RLS. Nothing else to do.

---

## 2. Vercel

### 2a. Import
1. Push this repo to GitHub/GitLab.
2. <https://vercel.com/new> → import the repo. Framework preset: **Next.js** (auto-detected). Root directory: repo root. Build command / output: defaults.

### 2b. Environment variables
Add these under **Settings → Environment Variables** (Production + Preview):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from 1d |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from 1d |
| `SUPABASE_SERVICE_ROLE_KEY` | from 1d |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-VERCEL-DOMAIN.vercel.app` |
| `OPENAI_API_KEY` | optional — enables Whisper transcription of rant audio |

### 2c. Deploy
Click **Deploy**. When it finishes, open the domain and go back to Supabase step
**1c** to make sure the Site URL / redirect matches the real domain.

### 2d. CLI alternative
```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL production   # repeat for each var
vercel --prod
```

---

## 3. First run checklist
- [ ] Visit `/signup`, create an account, land on `/dashboard`.
- [ ] `Start a project` → complete the 5-step wizard → workspace opens.
- [ ] Add an entry in a module; it shows in **Pulse** on the Overview.
- [ ] Add an Open Question, resolve it with an answer — the resolved count ticks up.
- [ ] Run a Prompted Brainstorm; route an answer to a module.
- [ ] (If `OPENAI_API_KEY` set) record a rant, confirm the transcript appears.

## 4. Keeping the schema in sync later
- Edit content in `src/content/` → `npm run gen:seed` → commit the new
  `supabase/migrations/*_seed_content.sql` → `npx supabase db push`.
- New tables/columns: add a new timestamped file in `supabase/migrations/`,
  then `npx supabase db push`. Never edit a migration that's already been pushed.
- Regenerate precise DB types anytime with a local stack:
  `npx supabase start` then `npm run gen:types`.

## 5. Local development
```bash
cp .env.example .env.local        # fill in values (local or hosted Supabase)
npx supabase start                # optional: local Postgres+Auth+Storage on :54321
npm run db:reset                  # applies migrations + seed to the local db
npm run dev                       # http://localhost:3000
```
