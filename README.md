# Todo Track

A two-week, self-paced module that teaches you to build one small thing all the way
through: a to-do list, in plain HTML, CSS, and JavaScript — no framework, no build
tool, no dependencies. It borrows its shape from
[codewithai101](https://github.com/vincentrosso/codewithai101): one file per
~2-hour day, an applied thread and a foundations thread running in parallel, and
AI that stays switched off until you can judge what it hands you.

**Pace:** ~2 hours/day, 5 days/week. Two core weeks (`W01D1.md` through `W02D5.md`),
plus an optional **Week 3** extension (`W03D1.md` through `W03D6.md`) that takes the
finished app further toward an iOS-Reminders-style feel.

**The rule:** in Week 1 you write every line yourself — no AI for code, no AI for
explanations. You can't tell whether Claude's code is any good in Week 2 if you've
never made the app work with your own hands.

## The app

A single-page to-do list. Add a task, mark it done, delete it. It remembers your
list between visits (`localStorage`). It ends deployed to a public URL. The core
two-week scope stops there — no accounts, no backend, no due dates, no filters. Small
on purpose, finished completely. **Week 3** deliberately breaks that ceiling: due
dates, a flag, multiple lists, swipe-to-delete, and drag-to-reorder, closer to the
real Reminders app.

## Repo layout

```
W01D1.md … W02D5.md   the core two weeks
W03D1.md … W03D6.md   optional Week 3: UI polish + Reminders-style features
docs/                 the app you build — one commit per day (named docs/, not src/,
                       so GitHub Pages can serve it directly from main)
tests/                a few unit tests, added on W02D5, extended through Week 3
broken/               a deliberately broken copy — you debug it by hand, AI off (W02D5)
journal/              one entry per day: what you built, what broke, what you didn't get
sidelines/            short reference notes — read when you're curious, not paced
CLAUDE.md             the AI rules for this repo
```

## The two threads

**Applied** — the app, growing every day, each day ending in something that runs and
a commit.

**Foundations** — one no-code, no-AI day each week (`W01D3`, `W02D3`, `W03D3`) on the
concepts under the code: the DOM tree, pure functions and JSON, CSS transitions and
Pointer Events. Each ends in a short self-quiz. No review.

## How each lesson is built

Every `W0xDx.md` follows the same shape:

- **Goal for today** — what you'll build, and the one sentence on how it feeds the
  finished app.
- **Time budget** — ~90 min hands-on, ~15 journal, ~15 slack.
- **Warm-up** — `git status`, commit yesterday's journal, re-run yesterday's
  deliverable, fix anything broken before starting. Broken things compound.
- **Numbered steps**, each time-boxed, each with the *what and why* in prose before any
  code. Type code, don't paste.
- **Break it deliberately** — change one line, reload, watch it fail, put it back.
  Reading errors is half the skill.
- **Commit** (and push, most days).
- **Journal** — four specific prompts, the last always "name one line you couldn't
  have written from scratch." One file per lesson: `journal/W01D1.md` …
  `journal/W03D6.md`.
- **What "done" looks like** — a checklist you can hold your work against.

## AI integration (graduated)

| When | Rule |
|------|------|
| Week 1 (`W01D1`–`W01D5`) | No AI. Not for code, not for explanations. |
| `W02D1`–`W02D4` | Claude may **explain**. Ask what a concept means or why code behaves the way it does. Never ask it to write code for you. |
| `W02D5` | Claude Code may write code — you review every diff before accepting, and you never accept a change you can't explain out loud. |
| `W03D1`–`W03D2` | Same as `W02D1`–`D4`: Claude may explain, never write. |
| `W03D4`–`W03D6` | Same as `W02D5`: Claude Code may write code, under review. |
| Foundations days (`W01D3`, `W02D3`, `W03D3`) | No AI, regardless of week. |

## Self-review (end of each week)

There's no mentor. At the end of `W01D5`, `W02D5`, and `W03D6`:

- **Demo the app to yourself** — click every button, actively try to break it.
- **Re-read the week's diffs:** `git log -p` from Monday's first commit.
- **(`W02D5` only) `broken/`:** find and fix the one planted bug with AI off. The fix
  is a single line. The point is the hunt.
- **(`W03D6` only)** name any known limitation out loud in the journal (e.g. touch
  drag-to-reorder) instead of letting it pass silently as "done."

## Day map

| Day | Applied | Foundations |
|-----|---------|-------------|
| W01D1 | Repo setup, paper sketch, the data model, first commit | what a data model is |
| W01D2 | Semantic HTML: the form and the empty list | — |
| W01D3 | — | **Foundations:** semantic HTML + the DOM tree (quiz) |
| W01D4 | CSS: layout, the list, the done state, mobile | the box model |
| W01D5 | JS: add a task to the page; **week self-review** | events |
| W02D1 | JS: toggle done + delete, with event delegation | reference vs value |
| W02D2 | Refactor: hold the list in a `tasks` array, render from it | state vs the DOM |
| W02D3 | — | **Foundations:** pure functions + JSON (quiz) |
| W02D4 | `localStorage`; edge cases: empty input, trim, long text, a counter | array methods |
| W02D5 | Split into modules, a few tests, deploy to GitHub Pages; **week self-review + `broken/`** | testing basics |
| W03D1 | iOS-style grouped list + custom circular checkbox | — |
| W03D2 | Swipe-to-delete with Pointer Events | — |
| W03D3 | — | **Foundations:** CSS transitions + Pointer Events (quiz) |
| W03D4 | Due dates + a flag (data model extension) | — |
| W03D5 | Multiple lists, with a migration from the old flat storage | — |
| W03D6 | Drag-to-reorder; final redeploy; **week self-review** | drag-and-drop vs pointer events |

## What "done" looks like for the core track (Weeks 1–2)

- The app is at a public URL and someone else can use it.
- Your list survives a page refresh and a full browser restart.
- `tests/` has at least three passing tests.
- `journal/` has ten entries.
- You can open any file in `docs/` and explain every line out loud.

## What "done" looks like for Week 3 (optional)

- The list is a grouped, rounded card with custom checkboxes; rows swipe to reveal
  Delete, with a keyboard-accessible equivalent.
- Tasks carry a due date (overdue ones shown in red) and a flag.
- More than one list exists, switchable by tabs, and a user's pre-Week-3 tasks
  survived the migration into it.
- Tasks can be reordered within a list by dragging.
- `tests/` has grown alongside every new pure function.
- `journal/` has sixteen entries total (ten from the core track, six from Week 3), and
  the touch-reorder limitation is named somewhere in them, not silently skipped.
