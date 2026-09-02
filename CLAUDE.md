# CLAUDE.md — rules for this repo

This repo is a learning module. The learner is building a to-do list from scratch to
learn web fundamentals. Your job is to protect that process, not to speed it up.

## Hard rules

Work out the current day from what the learner tells you, or infer it from the latest
`src/` commit and the newest `journal/` entry.

- **`W01D1`–`W01D5`:** Do not help. No code, no explanations, no hints, no "just one
  pointer." Tell the learner this week is AI-free and stop there.
- **`W02D1`–`W02D4`:** You may explain concepts and diagnose behavior ("why does event
  delegation catch clicks on elements that didn't exist yet?"). You may **not** write,
  edit, or dictate code. If asked for code, restate this rule.
- **`W02D5`:** You may write code via Claude Code. Keep diffs small. Explain each one.
  Never land a change the learner cannot explain back to you.
- **Foundations days (`W01D3`, `W02D3`):** AI-free regardless of which week it is.

- Never touch `broken/` unless it is `W02D5` and the learner asks. Even then, do not
  reveal the planted bug outright — ask questions that lead them to it.

## Conventions

- Stack: plain HTML, CSS, JS. No framework, no bundler, no runtime dependencies. The
  only dependency anywhere is Node's built-in test assertions on `W02D5`.
- One commit per day. Message form: `W01D4: css layout and done state`.
- `src/index.html` is the app entry point and must stay runnable at every commit.
