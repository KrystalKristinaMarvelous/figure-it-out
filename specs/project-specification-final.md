# Project Ideation & Planning Environment
## Product Specification — Final

**Version:** 1.0
**Status:** Complete. Supersedes all previous drafts.
**Working name:** TBD

---

## At a glance

A workspace for figuring out, planning, and tracking **any project** — creative, academic, professional, or personal.

**The promise:** *Figure it out first.*

**The gap it fills.** Notion hands you an empty page and asks you to build your own structure. Reedsy hands you a finished character sheet, but only for books. Asana assumes the plan already exists. Nothing serves the stretch where you have material but no shape — and that stretch is where most projects live longest and where people most often give up.

**How it works.** Two independent choices at creation — *what are you making* (5 categories, ~30 subtypes) and *where are you with it* (3 readiness states) — assemble a workspace out of pre-built, opinionated modules. The first choice determines which modules load; the second determines how they behave. Both stay editable forever.

**The engine.** Projects → Modules → Entries → Links. Four objects. Project types are templates on top, so adding one is a config file, not a release.

**Three ways in.** Rant freely (typed or spoken, transcribed, mined later) · brainstorm with prompts that produce many candidate answers · commit to one answer inside a module. Diverge, then converge.

**What the app doesn't do.** Nothing is built inside it. No manuscript editor, no CAD, no design canvas. You figure it out here, build it elsewhere, then bring the finished thing back to be recorded in your Portfolio.

**The unit of progress** is questions answered, not words written — because that's what the product actually claims to help with.

**What runs without AI:** the entire MVP. Open Questions, contradiction detection, Chaos Mode, gap finding, and the whole prompt library are templates, queries, and well-written content. The intelligence layer is an upgrade in phase 2, never a crutch holding up a thin app.

---

## Contents

| | |
|---|---|
| **Concept** | 1 What this is · 2 The two axes · 3 Creating a project |
| **Architecture** | 4 Architecture · 5 Module system · 6 Module library |
| **Working in it** | 7 Three modes of thinking · 8 Rant Space · 9 Brainstorming · 10 Open Questions |
| **Seeing it** | 11 Project Overview · 12 Tracking · 16 Dashboard |
| **Getting unstuck** | 13 Intelligence layer · 14 Chaos Mode |
| **Ending it** | 15 Finishing a project & the Portfolio |
| **Building it** | 17 Data model · 18 Design direction · 19 Technical approach · 20 Build phases · 21 Open questions |

---

## 1. What this is

A workspace for figuring out, planning, and tracking **any project** — a novel, a science fair entry, a marketing campaign, a wedding, a dissertation, a game, a trip, a business.

It covers the whole life of a project:

| | |
|---|---|
| **Ideate** | You know you want to make something. You don't know what. |
| **Brainstorm** | You have fragments. You need to see what they add up to. |
| **Plan** | You know what it is. You need to structure it. |
| **Track** | You're building it elsewhere. You need to know where you are. |
| **Finish** | It's done. Record it, keep it, move on. |

Most tools handle the middle two and abandon you for the first two. Notion gives you an empty page. Asana assumes the plan already exists. This handles all five, and the earliest stages are where it's most differentiated.

### 1.1 The core promise

**Figure it out first.**

You aren't writing the novel here, or running the experiment, or shipping the campaign. You work out what it is, track it while you build it elsewhere, and then bring the finished thing back to be recorded.

**Nothing is built inside the app.** This is a hard boundary, not a phasing decision. No manuscript editor, no CAD, no design canvas for final artwork, no spreadsheet. Production tools are mature, specialised, and already on the user's machine; competing with them would dilute the one thing this does that they don't. The app's territory is everything before and around the making.

### 1.2 What makes it different

**Opinionated modules, freely assembled.** Notion hands you Lego and says build your own character sheet. Reedsy hands you a finished character sheet, but only for books. This gives you finished, craft-informed structures for *every* kind of project, and lets you assemble them yourself.

**No privileged domain.** A trip, a thesis, a comic, and a product launch are peers. The engine knows nothing about fiction; it knows projects, modules, entries, and links. What differs between project types is entirely which modules load and what they ask you.

### 1.3 Principles

1. **Opinionated by default, editable by choice.** Never open empty. Never lock.
2. **Every field earns its place.** A field with no prompt behind it is a form. Twelve well-chosen fields beat forty.
3. **Capture is free.** Getting a thought in requires no decision about where it goes.
4. **Nothing is destroyed.** Removing a module archives it. Re-adding restores the data.
5. **The app asks, it doesn't tell.** Questions fail gracefully. Wrong assertions don't.
6. **Not knowing is progress.** Uncertainty gets tracked, not hidden.

### 1.4 Non-goals

Real-time collaboration · replacing the production tool (no manuscript editor, no CAD, no design canvas for final art) · publishing or hosting the output · native mobile apps (responsive PWA instead).

---

## 2. The two axes

Every project is defined by two independent choices made at creation, both editable forever after.

```
        AXIS 1 — WHAT ARE YOU MAKING?          AXIS 2 — WHERE ARE YOU?
        5 categories, ~30 subtypes             3 readiness states
        determines WHICH MODULES               determines HOW THEY BEHAVE
```

Neither is subordinate. They combine into the generated workspace.

### 2.1 Axis 1 — Categories

```
✦  CREATIVE            🎓  ACADEMIC             💼  PROFESSIONAL
   Novel                   Research project        Business idea
   Short story             Essay                   Research
   Screenplay              Presentation            Presentation
   Comic                   Science project         Campaign
   Game                    Study / revision        Product / project
   Worldbuilding           Dissertation            Event / launch
   Poetry collection       Coursework              Report

🎨  PERSONAL            ⚙️  CUSTOM
   Portfolio               Build your own workspace
   Personal website
   Event
   Trip
   Life project
   Home / renovation
   Learning goal
```

Every category is built to the same standard. There is no flagship vertical.

### 2.2 Axis 2 — Readiness

| State | Meaning | Emphasis |
|---|---|---|
| 🌱 **I just know I want to make one** | You've chosen a domain, not a project | **Generate.** Fewer modules, heavy prompting, rant and brainstorm front and centre. |
| 🌿 **I have a vague idea** | There's a shape but it's a mess | **Shape.** Structure modules first, gap detection on, open questions prominent. |
| 🌳 **I know what this is** | You need to build and finish it | **Execute.** Tasks, milestones, and tracking first. Prompting light, contradiction checks on. |

Readiness is not "how far along the tasks are." It's how well-defined the *idea* is. A project can be 🌳 on day one, and a project can sit at 🌿 for a year.

**Changing readiness is additive.** New modules appear, existing modules and all data are untouched. The app may suggest a change ("this has taken shape — move to *vague idea*?") but never imposes one.

### 2.3 The two axes combined

Same subtype, different readiness:

| | Science project · 🌱 | Science project · 🌿 | Science project · 🌳 |
|---|---|---|---|
| Lands on | Rant + Brainstorm | Question & Hypothesis | Procedure + Tasks |
| Modules | Question, Sources, Open Questions, Ideas | + Hypothesis, Variables, Method | + Data, Results, Report, Checklist |
| Prompting | Heavy — what are you curious about? | Medium — is this testable? | Light — gaps and contradictions only |
| Tracking | Off | Milestones only | Full |

| | Trip · 🌱 | Trip · 🌳 |
|---|---|---|
| Lands on | Brainstorm — where, why, with whom | Itinerary |
| Modules | Ideas, Inspiration, Open Questions, Budget sketch | Itinerary, Bookings, Budget, Packing, Documents, Tasks |

---

## 3. Creating a project

Five steps. Everything changeable later.

**1 — Category and subtype.** The grid above. Custom starts empty and opens the library.

**2 — Working title.** Plus an optional line of description. "Name it later" generates a placeholder, since being asked to name a thing you haven't had yet is a real blocker.

**3 — Specifications.** Free text ("what do you have in mind?") plus suggested tag chips per subtype — for Novel: fantasy, literary, YA, mystery. For Campaign: product launch, awareness, B2B, rebrand. For Trip: solo, family, backpacking, two weeks. Free entry always allowed. Tags refine module pre-selection and prompt variants.

**4 — Readiness.** The three states above, phrased plainly and without judgement.

**5 — Confirm your workspace.** The proposed module set shown as a checklist with one-line descriptions. Uncheck anything, add more from the library. Not skippable on a user's first project — this is where they learn modules are optional.

---

## 4. Architecture

### 4.1 The engine

```
PROJECT                    container: category, subtype, tags, readiness
   └── MODULES             which structured tools this project has (config)
         └── ENTRIES       the actual content
               └── LINKS   typed edges between entries, rants, and questions
```

Four objects. Everything else is a service over them or a presentation of them.

**Services** (read and write entries; not layers beneath them):

| Service | Role |
|---|---|
| **Capture** | Rant space. Unstructured in, triaged out. |
| **Prompting** | Prompt library, brainstorm sessions, Chaos Mode. Produces candidates. |
| **Intelligence** | Gap detection, contradictions, Ask Project. Reads across entries; writes nothing without consent. |
| **Tracking** | Tasks, milestones, deadlines, activity, progress. |

**Presentations** (how a module renders): sheet · slots · list · board · table · timeline · gallery · canvas.

### 4.2 Templates on top

```
                              ENGINE
                                │
     ┌──────────┬───────────────┼──────────────┬──────────┐
     ↓          ↓               ↓              ↓          ↓
  CREATIVE   ACADEMIC     PROFESSIONAL     PERSONAL     CUSTOM
```

A template is a named list of module keys plus prompt scoping and readiness weighting. Nothing more. Adding a new project type is a config file, not a release. Any new module inherits search, linking, gap rules, tracking, and Chaos Mode participation for free.

---

## 5. Module system

### 5.1 Anatomy

```
Module {
  key, name, icon, category_affinity[]
  presentation:   sheet | slots | list | board | table | timeline | gallery | canvas
  intro:          2–3 sentences on what this is for
  entry_schema:   [ Field ]
  gap_rules:      [ Rule ]          // structural checks, see §13.1
  suggested_with: [ module_key ]
}

Field {
  key, label, type, prompt, placeholder, repeatable
  type ∈ text | longtext | select | multiselect | date | number
       | image | file | link | reference | checklist | money | rating
}
```

Each module ships with a **fixed presentation**. No view-type switcher — a character sheet is a sheet, an itinerary is a timeline. Letting users re-render either as a kanban board adds configuration burden and removes the opinion, which is the thing being sold.

`reference` fields point at entries in other modules, producing backlinks without a graph UI.

### 5.2 What makes a module good

Field choice, field order, and prompt wording carry domain knowledge the user may not have. Demonstrated on the **Character Sheet**:

| Field | Prompt |
|---|---|
| Name | — |
| Role | Protagonist, antagonist, foil, mentor — or something you can't name yet |
| In one line | If a reader remembers one thing about them, what is it? |
| What they want | Concrete, external, statable in a sentence |
| What they need | The thing that would actually help — usually not the same |
| The lie they believe | What they've decided is true that isn't |
| Wound | What made the lie feel true |
| Arc | Start → end. "No change" is valid and sometimes better. |
| Contradiction | One thing that doesn't fit the rest. People aren't consistent. |
| What they'd never do | Often more revealing than what they would |
| How they speak | Rhythm, vocabulary, what they avoid saying |
| Relationships | *(reference)* with what each one costs them |
| Appearance | Last, deliberately. Rarely the useful part. |

And the same standard applied elsewhere — **Campaign Audience**: who they are · what they currently believe · what they'd have to stop believing · where they already are · what would make them ignore this · what would make them share it.

**Event Run of Show**: time · what happens · who's responsible · what has to be ready beforehand · what breaks if this runs late.

**Research Question**: the question in one sentence, no sub-clauses · why it matters · what would prove you wrong · what you can actually measure with what you have access to.

*This is the entire product.* The engineering is a schema-driven form renderer. The value is knowing which twelve fields belong in each module and what to say under each one. Source from craft books, methods texts, professional practice — don't invent taxonomies.

### 5.3 Adding and removing

A searchable **module library**, grouped by category, each entry showing name, description, field preview, and which project types recommend it. **Any module can be added to any project** — a business plan can take Three-Act Structure to shape a pitch; a novelist can take the academic Sources module.

Removing archives. Re-adding restores.

### 5.4 Custom modules (phase 3)

Define your own — name, presentation, fields with types and prompts. Optionally shareable. The honest endpoint of "entirely modular," but it arrives after the curated library proves itself, because a user-built module carries no guidance and guidance is the point.

---

## 6. Module library

### 6.1 Universal — available to every project

| Module | Presentation | Notes |
|---|---|---|
| **Rant Space** | timeline | Always present, cannot be removed. §8 |
| **Open Questions** | list | The spine. §10 |
| Ideas | grid | Unsorted material; auto-fed from unrouted brainstorm answers |
| Notes | list | Freeform |
| Tasks | board | To do / doing / done, with owner and due date |
| Milestones | timeline | Dated checkpoints |
| Sources & Research | table | Title, author, year, type, link, key takeaway, relevance |
| Inspiration | gallery | Images, links, quotes — each with a "why this" field |
| Decisions Log | list | What was chosen, what was rejected, why |
| Budget | table | Item, estimated, actual, status |
| People | table | Name, role, contact, what they're responsible for |
| Files & Assets | gallery | Uploads of any kind |
| Glossary | table | Terms and names — also feeds transcription vocabulary (§8.3) |
| Activity Log | timeline | Auto-populated |

### 6.2 Creative

**Structure** — Three-Act Structure · Save the Cat Beat Sheet · Hero's Journey · Kishōtenketsu · Freeform Outline · Chapter Plan · Scene Cards · Sequences

**Character** — Character Sheet · Cast Overview · Relationship Map · Arc Tracker

**World** — Places · Cultures & Peoples · Magic/Technology System *(with a mandatory* Limits *field — rules matter more than powers)* · History & Timeline · Factions & Power · Language & Naming · Rules of the World

**Craft** — Themes & Motifs · POV & Voice · Style Sheet

**Form-specific** — Comic: Page & Panel Plan, Script · Game: Core Loop, Mechanics, Systems, Levels, Player Experience Goals · Poetry: Poem List, Forms & Constraints, Image Bank, Collection Order · Screenplay: Beat Board, Scene Headings, Character Wants by Scene

### 6.3 Academic

Research Question & Hypotheses · Literature Review *(source cards with argument, method, findings, limitations, relevance)* · Methodology *(approach, sample, procedure, instruments, ethics, why this method over alternatives)* · Variables · Data & Observations · Analysis · Argument Map *(thesis, claims, evidence, counterarguments, rebuttals)* · Essay Outline *(with a "what does this paragraph do" field)* · Citations *(style selector, exportable)* · Rubric & Requirements *(paste the brief, turn each requirement into a checkable item)* · Science Project *(hypothesis, materials, procedure, observations, results, conclusion)* · Study Plan *(syllabus breakdown, topic confidence, revision schedule, past papers, weak areas)* · Supervisor Log

### 6.4 Professional

Problem & Opportunity · Customer / Audience · Value Proposition · Competitors · Business Model *(revenue, costs, unit economics, assumptions)* · Go-to-Market · Risks & Assumptions *(assumption, confidence, cheapest way to test it)* · Campaign *(audience, core message, channels, calendar, assets, KPIs)* · Product Requirements *(user stories, acceptance criteria, priority)* · Roadmap · Presentation *(audience & goal, one-sentence takeaway, narrative arc, slide outline, delivery notes, anticipated questions)* · Stakeholders · Meeting & Feedback Log · Metrics

### 6.5 Personal

Portfolio *(piece list, selection criteria, ordering, artist statement, bio)* · Website *(sitemap, page content, design direction, references, tech decisions)* · Event *(guest list, run of show, vendors, contingencies)* · Trip *(itinerary by day, bookings, places, packing, documents)* · Home & Renovation *(rooms, decisions, quotes, suppliers, sequence)* · Learning Goal *(syllabus, resources, practice log, checkpoints)* · Life Project *(goal, why it matters, milestones, habits, obstacles, support)*

### 6.6 Custom

Starts with Rant Space and Open Questions only, opening directly into the library. Named however the user likes.

---

## 7. Three modes of thinking

The distinction between these three is the architecture:

| Mode | Shape | Commitment | Answers |
|---|---|---|---|
| **Rant** | Chronological, unstructured | None | What's in my head right now? |
| **Brainstorm** | Many parallel candidates | None | What could this be? |
| **Modules** | Structured fields, one value each | Yes | What is this? |

Material flows **rant → brainstorm → module**. Backward movement is allowed; the default direction is toward commitment.

This resolves the apparent overlap between a brainstorm prompt asking "what do they want?" and a Character Sheet having a `want` field. The brainstorm holds five candidates and no decision. The sheet holds the decision.

---

## 8. Rant Space

Present in every project, removable from none. It's why someone at 🌱 has anything to put in the modules.

### 8.1 Capture

- **Type** — plain textarea. No title, no tags, no formatting toolbar. Autosaves.
- **Record** — in-browser audio, live waveform, no length cap.

Reachable from every module via a fixed button and a global hotkey; opens over the current screen without navigating away. Optional mood and tags, both skippable.

### 8.2 Review

Reverse-chronological stream, audio inline with transcript beneath. Full-text search across typed rants and transcripts. Filters by date, tag, mood, has-audio, mined/unmined. Calendar heatmap. A **resurface** control showing an old rant at random — the archive only pays off if it gets read again.

### 8.3 Transcription

Audio is kept permanently alongside the transcript. Non-negotiable: transcription reliably mangles invented names, technical terms, and non-English proper nouns — exactly the highest-value words. A garbled word must always be recoverable by listening.

**Vocabulary biasing:** pass the project's existing names, places, and Glossary terms into the transcription request as a hint. A name typed once by hand gets spelled correctly in every later recording.

Options: Whisper API (~$0.006/min, best accuracy, real per-user cost) · in-browser Whisper via WASM (free and private, 40–150MB first load, slow on cheap phones — which is where voice capture happens) · Web Speech API (free, Chrome-only, live-only, weakest on unusual words). **Recommend Whisper API for v1** with a minutes cap. Long recordings upload in chunks.

### 8.4 Triage

Select any span of a rant → **Send to…** → the modules currently in this project.

Creates the entry, seeded with the text, with a `derived_from` link back. The rant is unchanged; the mined span gets a subtle underline showing what it became. On the entry, a chip reads "from a rant on 14 March" and opens the original, audio included.

The destination list being drawn from the project's active modules is what makes the two halves one app.

### 8.5 Recurrence (phase 2)

For 🌱 projects the rant pile is the raw material, and its value is only visible in aggregate. Surface what repeats — nouns, images, and themes recurring across weeks; entries from different months that echo.

**Observe, don't interpret.** "You've mentioned drowning eleven times" is useful and verifiable. "Your novel is about grief" is presumptuous and irritating when wrong.

---

## 9. Brainstorming

Two modes. Build the second one first.

### 9.1 Prompted Brainstorm

Cheap to build, hard to write, and the most differentiated feature in the product.

**Entry:** *What are you trying to figure out?* — multi-select, topics varying by category. Creative sees character motivation, plot, world, themes. Academic sees research angle, counterarguments, method alternatives. Professional sees customer objections, failure modes, positioning. Personal sees priorities, constraints, what would make this worth doing.

Sessions can also start seeded — from a gap finding, an entry, a rant fragment, or a Chaos card.

**The session:** one prompt at a time, full screen.

```
  What do they want?
  ┌────────────────────────────────────┐
  └────────────────────────────────────┘
  + add another possibility

  [ Skip ]  [ I don't know yet ]  [ Another angle → ]
```

- **Multiple answers per prompt, encouraged.** One answer is a form; five is a brainstorm. Star a favourite later, or don't.
- **Another angle** rephrases the same question — *"What would they say they want if you asked them at 3am?"* Static alternates in v1.
- **"I don't know yet"** is a first-class answer, not a skip. It writes an Open Question. Not knowing becomes a tracked artifact instead of a dead end.
- Follow-ups branch on the answer. No timer, no forced order, no completion percentage.

**Sample set — Research angle:** What question are you actually asking, in one sentence? · Who has asked something close to this? · What would have to be true for your answer to be interesting? · What result would prove you wrong? · What can you measure with what you have access to? · If you got half the data you wanted, what could you still say?

**Sample set — Event:** Who is this actually for? · What do you want them saying afterwards? · What's the one thing that must not go wrong? · What are you doing because it's expected rather than because it matters? · What's your contingency if the weather turns?

**Closing:** a review screen. Per answer — **send to module** (routing to the matching field, creating the entry if needed), **keep as note**, or **discard**. Unreviewed sessions stay open; nothing auto-commits.

**Prompt library** is stored as data, authored per topic and project type, with alternates and branching rules. Same principle as module fields: small engineering, large writing task.

### 9.2 Freeform Canvas (phase 2)

Infinite canvas. Sticky notes, text, images, freehand, labelled connectors ("causes", "conflicts with", "leads to"), frames.

**Entry cards** — live references to real entries. A character card on the canvas *is* the character; editing it updates the module. These are the only reason to build this rather than telling users to open Miro. Everything else here is a commodity.

Multiple named canvases per project. Select a cluster → **make this into…** → creates an entry seeded from the cluster. Links drawn on canvas become `links` rows and appear as backlinks inside modules.

**Honest scoping:** the most expensive component in the app and the least differentiated. `tldraw` handles canvas, shapes, arrows, undo, and JSON persistence; custom shapes handle entry cards. Budget several weeks. If the schedule slips, cut it — the product is complete without it.

---

## 10. Open Questions

The spine, and the source of the product's sense of progression.

### 10.1 The primary metric

Word count measures writing. Task completion measures execution. This app's promise is *figure it out first* — so the honest unit of progress is **questions resolved**.

```
  You've figured out 23 things about this project.
  14 still open.
```

Not a percentage — there's no denominator, and a fake one on a creative project is worse than no number.

### 10.2 Sources

Brainstorm "I don't know yet" · gap detection findings the user keeps · Chaos Mode cards taken · rant triage · typed directly from the command palette. Arriving from five directions means the module is never empty and never feels like homework.

### 10.3 Structure

```
Question {
  text
  priority     blocking | important | minor      (🔴 🟡 🟢)
  status       open | exploring | resolved
  answer       required on resolution
  resolved_to  optional reference to where the answer now lives
  linked       related entries
  source       brainstorm | gap | chaos | rant | manual
  created_at, resolved_at
}
```

**Blocking** means genuinely can't proceed — reserve it, or everything turns red. Default to *important*. `exploring` marks a question you've opened a brainstorm on but not settled; without it, the middle of the work is invisible.

### 10.4 Resolution

Marking solved **requires writing the answer**. The record of what you decided is worth more than the checkbox. Resolved questions archive rather than vanish, and the archive doubles as a decision history: what you wondered, what you chose, when, where it ended up.

### 10.5 Display rules

- Open questions rising is **not** a warning. At 🌱 and 🌿 it's the main evidence of progress. No red badges, no alert styling.
- Sort by priority, then age. Surface the three oldest blocking questions on the Overview.
- Open more than 30 days → a gentle "still stuck on this?" with one-tap routes into brainstorm or Chaos Mode. Dismissible, at most monthly.

---

## 11. Project Overview

The landing screen. Answers *what am I making* before anything else loads.

### 11.1 Identity

```
┌──────────────────────────────────────────────────────────┐
│  THE WINTER CROWN                          🌿 Vague idea   │
│  Creative → Novel                                         │
│                                                           │
│  A princess discovers that her sister's death may have    │
│  been arranged by the court.                              │
│                                                           │
│  Target  80,000 words    Deadline  Dec 2026   Touched 2d  │
└──────────────────────────────────────────────────────────┘
```

The **one-line idea** is the most important field on the screen and doubles as a forcing function. Being unable to write it is real information, so the empty state says so rather than nagging: *"Not sure yet? That's normal this early. Try a brainstorm."* For 🌱 projects it starts empty and filling it in is a visible milestone.

Target type varies by project — words, pieces, pages, guests, budget, a date. Optional. Progress shows only when a target exists rather than being faked.

### 11.2 Pulse

A count per active module, each linking in, each with a weekly delta.

```
IDEAS               47      +6 this week
CHARACTERS           8      +1
PLACES              12      —
TIMELINE            23 events
SOURCES              6
OPEN QUESTIONS      14      +3
TASKS              9 / 22
```

A `COUNT` per module with deltas from `created_at > now() - 7 days`. Cheap, and it's what makes a project feel alive between sessions. Labels use the module's plural noun. Empty modules show `0` rather than hiding — an empty module is information.

**No streaks.** Projects are legitimately intermittent, and a broken streak punishes people for having a life. The delta shows momentum without implying failure at zero.

### 11.3 Status

🌱 Seed · 🟡 Developing · 🔵 Building · 🟠 Refining · ✅ Done · 💤 Dormant. User-set, distinct from readiness. Dormant is offered after long inactivity, never imposed.

---

## 12. Tracking

Not an afterthought — for 🌳 projects it's the main surface.

### 12.1 Tasks

Board or list. Title, notes, due date, owner, priority, `blocked_by`, and a reference to the entry it relates to (a scene, a chapter, an experiment, a vendor). Tasks can be created from anywhere via the command palette, and generated from checklist fields inside other modules.

### 12.2 Milestones and deadlines

Dated checkpoints on a timeline, with the project deadline anchoring the right edge. Countdown appears inside 30 days. Milestones can require entries — "first draft outline" completes when the Three-Act module has all slots filled, "method approved" when the Supervisor Log has an approval entry.

### 12.3 Progress

Four independent signals, shown separately rather than fused into one misleading number:

| Signal | Meaning |
|---|---|
| **Questions figured out** | 23 answered, 14 open |
| **Tasks** | 9 of 22 done |
| **Target** | 24,000 of 80,000 words · 6 of 12 pieces · ₹48,000 of ₹120,000 |
| **Completeness** | Which module fields are empty — shown, never scored |

Completeness is deliberately not a percentage. A filled form is not a finished project, and implying otherwise trains the wrong behaviour.

### 12.4 Activity

An auto-populated log — entries created, questions resolved, modules added, sessions run. Feeds the deltas and the dashboard's "last touched." Also the honest answer to "what did I actually do last month."

---

## 13. Intelligence layer

**The app is a consultant, not an author.** It reads your project and asks better questions than you'd ask yourself. It does not write your prose, your essay, or your pitch.

Three hard rules:

1. **Grounded or silent.** Every claim cites the entries it came from, clickable. If it can't cite, it doesn't say it.
2. **Questions over assertions.** A question fails gracefully; a wrong assertion erodes trust in the whole feature.
3. **Writes nothing.** Output is ephemeral until the user takes it into a module or a question.

### 13.1 Gap detection — "you haven't figured out…"

**Tier 1 — structural, rule-based, MVP, no model.** Declared per module in `gap_rules`. Deterministic, free, never wrong.

| Rule | Example |
|---|---|
| Key field empty on a key entry | Your antagonist has no *want* |
| Required pairing | Your magic system has no *limits* |
| Orphaned entry | Kesh appears in no scenes |
| Unused reference | Two sources haven't been cited anywhere |
| Stale question | "How does the succession work?" has been open 41 days |
| Empty structural slot | Act Two has no midpoint |
| Domain-specific | A hypothesis with no method · a campaign channel with no asset · an event with no contingency |

**Tier 2 — semantic, phase 2, opt-in.** Reads across entries for holes rules can't see.

> ⚡ Why does the antagonist need the princess alive?
> *Irae's plan requires the succession to stay contested, but his stated method removes the only other claimant.*

Max three shown. Always a question. Individually and permanently dismissible. Never blocks, never badges. One-tap **take this to brainstorm** — the app noticed the hole *and* handed over the tool for filling it.

### 13.2 Find contradictions

**Tier 1 — deterministic, MVP, no model.**

> Raven is listed as 17 during the Winter Ball, but your timeline places the Winter Ball two years after her 18th birthday.

Date arithmetic. No model, never wrong, instant, free, works offline.

**This requires typed fields** — a schema requirement flowing back into module definitions. Structured `date` and `number` on characters, events, scenes, bookings, and budget lines. Fields accept prose *or* structure; checks run only on the structured ones, with a quiet "make this a date?" affordance rather than a blocking requirement. Forcing a novelist to pick a birth year before they've decided one is hostile.

Available checks: age vs. event date · a character in a scene dated before their introduction or after their death · two entries claiming the same unique role · a location referenced but never defined · chapter targets summing below the project target · budget lines exceeding the budget · method stating n=40 against 31 data rows · two bookings overlapping.

**Tier 2 — semantic, phase 2.** Motivation incoherence, stated theme versus what the scenes do, a conclusion overreaching its method, a campaign message contradicting the stated audience belief.

### 13.3 Ask Project

```
🧠  Why does my plot feel weak around Act II?

    You have three major events between the inciting incident
    and the midpoint, but none of them changes Raven's
    situation. She wants the same thing, knows the same
    things, and has the same options after all three.

    From: Three-Act Structure · Scene Cards (3) · Raven

    [ Brainstorm complications ]   [ Log as open question ]
```

**Retrieval, not context-stuffing.** A mature project won't fit in a prompt. v1 routes by module — parse which modules the question implicates, load those entries plus anything linked. Phase 3 adds embeddings. This is the main engineering cost of the AI layer; a model reasoning over the wrong twelve entries gives confidently irrelevant answers.

Every answer ends in an action.

### 13.4 What the AI never does

Write prose, scenes, essay paragraphs, or copy for the project · fill module fields without explicit acceptance · assert facts about quality or meaning · generate content offered as the user's own.

The pitch is *figure it out first*. A tool that writes it for you contradicts its own premise.

---

## 14. Chaos Mode

For when you're stuck. Recombines what's already in your project into provocations.

### 14.1 A random walk, not a model

Every one of these is a template filled from randomly selected entries:

```
What if {entry.A} is wrong about {entry.B}?
Who benefits most from {event}?
What happens if {event} moves five years later?
What would happen if {person} knew {question}?
How could {entry.X} and {entry.Y} be connected?      ← different modules
What if {rule} has an exception?
Remove {entry}. What breaks?
What does {person} want that you haven't written down?
Which of these is wrong: {fact.A} or {fact.B}?
```

Real randomness over the entry graph produces genuine surprise, costs nothing, and **cannot hallucinate** — every noun is something the user wrote. Ship this in the MVP; generated provocations are a phase-2 layer over the same mechanism.

Selection weights toward pairs with **no existing link**, since the useful surprises come from connecting things you've kept apart.

Templates are authored per category — a campaign gets *"what if your audience already tried this and it failed?"*, a trip gets *"what if you had three days instead of ten?"*

### 14.2 Session

Five cards, one at a time. Per card: **[ Reroll ] · [ Keep as question ] · [ Brainstorm this ] · [ Nothing here ]**.

"Nothing here" down-weights that template for this user. Requires roughly ten entries minimum; below that it offers the Prompted Brainstorm instead, since chaos needs material to be chaotic with.

Reachable from the command palette anywhere, offered on the Overview when a project has gone quiet, and when a question has been blocked for weeks. Not a tab — a state you enter and leave.

**Needs volume:** twenty templates feel repetitive within a week. Target a hundred-plus across categories.

---

## 15. Finishing a project & the Portfolio

The app's exit. A project ends here, and what it leaves behind is the reason to keep using the app for years.

### 15.1 Why this matters more than it looks

Planning tools have a retention problem: once the plan exists, the user graduates to the production tool and never comes back. The portfolio inverts that. The app becomes the record of everything you've made — across projects, across categories, across years — and that hook gets **stronger** with use rather than weaker. A user three years in has something here they can't get anywhere else.

### 15.2 What's actually valuable in it

Anyone can keep a folder of finished PDFs. What only this app can attach to a finished piece is **the process**:

- The questions you answered getting there, and what you answered them with
- The decisions you made and what you rejected
- The rant the idea started in — audio included
- Your original one-line idea, next to the final one
- How long it took, and where the long silences were

A portfolio entry that reads *"8 months · 47 questions figured out · started as a completely different story"* is something no file folder and no other tool can produce. Build the portfolio around the process, not around the artifact.

### 15.3 The completion flow

**1 — Mark it finished.** Available from the Overview at any time. No requirement that tasks be closed or fields filled; people finish messy.

**2 — Upload the finished thing.** Optional, and multiple items allowed: a document, photos of the artwork, a slide deck, a link to the published site or paper, a video. Files or links both. Skippable — some projects have no uploadable artifact, and a trip that happened is still finished.

**3 — Reflect.** Three or four short prompts, all skippable:

> Your original idea was: *"A princess discovers her sister's death may have been arranged."*
> How did it actually turn out?
>
> What surprised you?
> What would you do differently?
> What did this teach you for the next one?

Showing the original one-liner beside the finished work is the single best moment the app can offer, and it costs nothing — the text has been sitting in the database since day one.

**4 — It moves to the Portfolio.** The project is not deleted, closed, or made read-only. Every module, rant, question, and decision stays fully browsable.

### 15.4 Shelved, not just finished

Most projects don't finish. A portfolio that only records successes becomes quietly accusatory over time, and the app's whole posture is against that.

So there are two exits:

| | |
|---|---|
| ✅ **Finished** | It's done. Appears in the portfolio. |
| 📦 **Shelved** | Not now. Kept, searchable, revivable, and *not* counted as a failure anywhere in the UI. |

Shelved projects live in their own view, with a one-tap **reopen**. The framing everywhere is "set aside," never "abandoned" or "incomplete." A shelved project's material also stays available to Chaos Mode and search across the account — an idea you dropped two years ago resurfacing inside a live project is exactly the kind of connection this app should make.

### 15.5 The Portfolio view

A gallery of finished work — artifact thumbnail where one exists, title, category, and the year. Views: **grid**, **timeline by year**, and **by category**.

Opening an entry shows the artifact, the reflection, the process stats, and a way into the full project workspace behind it.

Lifetime stats across the portfolio, stated plainly and never gamified:

```
  17 projects finished        4 shelved
  312 questions figured out
  Creative 8 · Academic 4 · Professional 3 · Personal 2
  Longest: 14 months     Shortest: 3 weeks
```

### 15.6 Reopening

A finished project can be reopened — revisions happen, papers get rejected, second editions exist. Reopening returns it to active and records the reopen in the activity log. A project can be finished more than once; the portfolio entry shows the most recent completion with earlier ones as history.

### 15.7 Sharing (phase 3)

For an artist, a student, or a freelancer, this is a real portfolio. A read-only public view — selected projects, artifact-forward, process shown only where the user opts in — is a natural extension. Deliberately deferred: it introduces privacy surface, permissions, and public-page design, none of which the core product needs to prove itself.

---

## 16. Dashboard

Grid of project cards: title, one-line idea, category → subtype, readiness, status, progress, last touched, next milestone. Filter by status, category, readiness; sort by recent, deadline, progress.

Three views: **Active** · **Shelved** · **Portfolio**.

**Quick Capture** files a rant into any project without opening it.

Empty state: one "Start a project" card plus three example projects from different categories, openable read-only.

---

## 17. Data model

```
users
  id, email, display_name, created_at, settings(jsonb)

projects
  id, user_id, title, one_liner, original_one_liner,
  category, subtype, spec_tags(text[]),
  readiness(seed|vague|defined), status,
  lifecycle(active|shelved|finished),
  target_type, target_value, deadline,
  finished_at, shelved_at, reflection(jsonb),
  created_at, updated_at, last_touched_at

artifacts                         -- the finished thing(s)
  id, project_id, kind(file|link), file_url, link_url,
  mime_type, title, caption, is_cover, order_index,
  completion_index,               -- which completion this belongs to
  created_at

module_definitions                -- the library; app-authored + user-authored
  id, key, name, icon, presentation, intro,
  entry_schema(jsonb), gap_rules(jsonb),
  category_affinity(text[]), suggested_with(text[]),
  author_id(nullable), is_public, version

project_modules                   -- which modules this project has
  id, project_id, module_definition_id, custom_name,
  order_index, status(active|archived), config(jsonb)

entries                           -- every card, character, source, task, beat, booking
  id, project_id, project_module_id,
  title, values(jsonb), status, order_index,
  created_at, updated_at

rants
  id, project_id, mode(text|audio), body_text,
  audio_url, transcript, transcript_status,
  duration_ms, mood, tags(text[]), created_at

questions
  id, project_id, text, priority, status, answer,
  resolved_to_entry_id, source, created_at, resolved_at

links
  id, project_id, from_type, from_id, to_type, to_id,
  relation(derived_from|references|related|blocks), created_at

brainstorm_sessions
  id, project_id, topics(text[]), seed_type, seed_id,
  status(open|reviewed), created_at, completed_at

brainstorm_responses
  id, session_id, prompt_key, prompt_text,
  answers(jsonb), starred_index,
  disposition(pending|sent|kept|discarded), sent_to_entry_id

prompt_library
  id, key, topic, categories(text[]), subtypes(text[]),
  question, hint, alternates(jsonb), followup_rules(jsonb)

chaos_templates
  id, template, categories(text[]), slot_spec(jsonb), weight

canvases
  id, project_id, name, document(jsonb)

canvas_refs
  id, canvas_id, shape_id, entry_id

gap_dismissals
  id, project_id, gap_key, dismissed_at

activity
  id, project_id, kind, subject_type, subject_id, created_at
```

`entries.values` is JSONB keyed to the module's `entry_schema`, validated in the application layer against a schema registry. **Schema changes are additive and versioned** — adding a field to a module must never orphan existing entries.

`project_modules` is the entire modularity mechanism. Add = insert a row. Remove = set archived; entries survive.

---

## 18. Design direction

Reference points: Scrivener's density, Milanote's materiality, Obsidian's connectedness. A working studio, not an office.

### 18.1 The organizing idea

**Colour encodes uncertainty.** A single accent is reserved exclusively for *unresolved* state — open questions, empty required fields, unreviewed brainstorm sessions, undismissed gaps. Everything settled renders monochrome.

A project therefore **visibly quiets as you figure it out**, and the amount of colour on screen tells you at a glance how much is still unknown. Colour does structural work rather than decoration, and it's tied directly to the product's promise.

Spend the boldness here; keep everything else disciplined.

### 18.2 Tokens

```
                Light        Dark
surface         #E7EAE9      #16191B
raised          #F2F4F3      #1E2225
ink             #14171A      #E9EDEC
muted           #697178      #8A9299
hairline        #C9CFCE      #2C3134

unresolved      #B8177A      #E24BA4     the only accent; state, not decoration
chaos           #4B34E8      #7C68FF     Chaos Mode only, nowhere else
```

A cool, slightly green-grey base — a studio wall, not paper — so the magenta reads as signal rather than mood. Deliberately not the warm-cream-and-terracotta palette every "creative tool" lands on.

Per-project accent themes tint chrome only. The unresolved colour is constant across all projects, because it means something.

Dark mode is built from the same tokens on day one. Retrofitting is the expensive path.

### 18.3 Type

Two families with a real division of labour:

- **The app's voice is serif.** Every prompt, question, gap finding, and Chaos card. Generous line height, ~66 character measure.
- **The user's structure is sans.** Field labels, module names, navigation, counts, tables.

The tool's questions and the user's material are typographically distinct everywhere, without a single label saying so.

Avoid all-caps labels, single accented words in headlines, eyebrow labels above every heading, monospace for small data labels.

### 18.4 Surface and motion

Cards differentiate by border weight and background tint, not drop shadows. Small radius, hairline borders. Density is a feature — this is for people with a lot of material, and generous whitespace everywhere makes a mature project feel emptier than it is. Entry cards vary in size by content type; identical rounded rectangles for a character, a source, and a booking would be wrong information design.

**One orchestrated motion moment: resolving a question.** The accent drains, the card settles, the resolved count ticks up. That's the core loop of the entire product and it should feel good every time. Everything else is instant. Motion answers actions — opening, expanding, confirming — and otherwise stays out of the way. Respect `prefers-reduced-motion`.

### 18.5 Interaction essentials

Ranked by value per unit of work:

1. **Command palette (⌘K)** — jump to any entry, add to any module, start a brainstorm, open Chaos Mode, log a question, create a task. Highest value, lowest cost.
2. **Global capture hotkey** — rant from anywhere.
3. **Search** — full text across entries, rants, transcripts, questions, grouped by module.
4. **Keyboard navigation** in every list and sheet.

Explicitly not doing: streaks, confetti, badges, gamified completion.

### 18.6 Empty states

Every empty module shows a filled-in example plus one action. Never "No entries yet."

> **Open Questions**
> Nothing here yet. Most projects start with more questions than answers — that's the point.
> [ Add a question ] · [ Run a brainstorm ]

---

## 19. Technical approach

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind + shared component set built on the token system |
| Forms | **Schema-driven renderer** — one component maps `entry_schema` to inputs |
| Text | Lightweight editor (Tiptap) on `longtext` fields only |
| Database | Postgres (Supabase) — JSONB, full-text search, row-level security |
| Auth | Supabase Auth |
| Storage | S3-compatible for audio, images, files |
| Transcription | Whisper API, queued, with vocabulary hints |
| Canvas (phase 2) | tldraw with custom entry-card shapes |
| Hosting | Vercel |

**The schema-driven form renderer is the key build.** Get it right and the entire module library becomes content authoring rather than feature development — which is the only thing that makes a library this large tractable for a small team.

---

## 20. Build phases

### Phase 1 — MVP

Auth · dashboard · two-axis wizard · schema-driven module renderer · module add/remove · universal module set · Rant Space with audio, transcription, and triage · Open Questions wired to all sources · Prompted Brainstorm · Project Overview with Pulse · Tier 1 gap detection and contradiction checks · Chaos Mode with template random-walk · tasks and milestones · **completion flow, artifact upload, shelving, and the Portfolio** · command palette · dark mode · Markdown/JSON export.

The portfolio is small to build and is the product's long-term retention mechanism, so it belongs in the MVP even though few users will reach it in the first months.

Module libraries at launch: the **universal set** plus **one subtype from each of the five categories**, so no category ships as a stub.

**Everything above works with zero model calls.** The MVP is a complete, useful product with the AI switched off — which is the right position to build from, because it means the app has to earn its keep before any model is involved.

*Ship criterion:* a person at 🌱 in any of the five categories can use this for six weeks and end with a defined project, a filled-in workspace, and a record of what they figured out.

### Phase 2

Remaining subtypes across all categories · Freeform Canvas with live entry cards · Tier 2 semantic gaps and contradictions · Ask Project with module-routed retrieval · generated Chaos provocations and brainstorm rephrasings · rant recurrence · PDF/DOCX export.

### Phase 3

Custom modules and prompt sets · shareable templates · embeddings retrieval · secondary-world calendars · offline PWA · **public read-only portfolio pages**.

---

## 21. Open questions

1. ~~Where does the app stop?~~ **Resolved.** Nothing is built inside the app. Users finish elsewhere, upload the artifact, and the project moves to the Portfolio. See §1.1 and §15.
2. **Artifact storage cost.** Finished work is kept indefinitely by design — that's what makes the portfolio worth having — so storage grows monotonically and never churns. Needs a per-file size cap, a per-account quota, and a link-only option for large work. Decide before launch, not after.
3. **Does the portfolio need its own quality bar?** If a user finishes fifteen projects, the portfolio becomes the app's most-seen screen. It may deserve more design attention than its size suggests.
4. **Content volume.** Roughly 30 subtypes × well-written module sets, plus several hundred brainstorm prompts, plus a hundred-plus Chaos templates. This is the largest task in the product and needs scheduling as content work, not engineering.
5. **Library browsability.** Sixty-plus modules is a strong product and a hard browse. Needs good search, categories, and recommendations.
6. **Module versioning.** When a module gains a field, do existing projects get it? *Recommendation: offer, don't impose.*
7. **Typed-field friction.** Structured dates buy contradiction detection but add entry cost. The prose-or-structure compromise needs testing.
8. **Transcription cost ceiling.** Free-tier minutes, or transcribe on demand?
9. **Where the accent stops.** If too much counts as "unresolved," the screen is always magenta and the signal dies. Needs a tight, tested definition.
10. **Cross-project reuse.** Should a worldbuilding set or a supplier list be shareable between two projects — and should a shelved project's material feed Chaos Mode in a live one?
