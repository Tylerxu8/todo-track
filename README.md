# Todo Track

A two-week, self-paced module that teaches you to build one small thing all the way
through: a to-do list, in plain HTML, CSS, and JavaScript — no framework, no build
tool, no dependencies. It borrows its shape from
[codewithai101](https://github.com/vincentrosso/codewithai101): one file per
~2-hour day, an applied thread and a foundations thread running in parallel, and
AI that stays switched off until you can judge what it hands you.

**Pace:** ~2 hours/day, 5 days/week, 2 weeks. Ten lesson files, `W01D1.md` through
`W02D5.md`.

**The rule:** in Week 1 you write every line yourself — no AI for code, no AI for
explanations. You can't tell whether Claude's code is any good in Week 2 if you've
never made the app work with your own hands.

## The app

A single-page to-do list. Add a task, mark it done, delete it. It remembers your
list between visits (`localStorage`). It ends deployed to a public URL. That is the
whole scope — no accounts, no backend, no due dates, no filters. Small on purpose,
finished completely.

## Repo layout

```
W01D1.md … W02D5.md   the daily lessons
src/                  the app you build — one commit per day
tests/                a few unit tests, added on W02D5
broken/               a deliberately broken copy — you debug it by hand, AI off (W02D5)
journal/              one entry per day: what you built, what broke, what you didn't get
sidelines/            short reference notes — read when you're curious, not paced
CLAUDE.md             the AI rules for this repo
```

## The two threads

**Applied** — the app, growing every day, each day ending in something that runs and
a commit.

**Foundations** — one no-code, no-AI day each week (`W01D3`, `W02D3`) on the concepts
under the code: the DOM tree, pure functions, JSON. Each ends in a short self-quiz.
No review.

## AI integration (graduated)

| When | Rule |
|------|------|
| Week 1 (`W01D1`–`W01D5`) | No AI. Not for code, not for explanations. |
| `W02D1`–`W02D4` | Claude may **explain**. Ask what a concept means or why code behaves the way it does. Never ask it to write code for you. |
| `W02D5` | Claude Code may write code — you review every diff before accepting, and you never accept a change you can't explain out loud. |
| Foundations days (`W01D3`, `W02D3`) | No AI, regardless of week. |

## Self-review (end of each week)

There's no mentor. At the end of `W01D5` and `W02D5`:

- **Demo the app to yourself** — click every button, actively try to break it.
- **Re-read the week's diffs:** `git log -p` from Monday's first commit.
- **(`W02D5` only) `broken/`:** find and fix the one planted bug with AI off. The fix
  is a single line. The point is the hunt.

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

## What "done" looks like for the track

- The app is at a public URL and someone else can use it.
- Your list survives a page refresh and a full browser restart.
- `tests/` has at least three passing tests.
- `journal/` has ten entries.
- You can open any file in `src/` and explain every line out loud.
