# broken/ — the W02D5 bug hunt

A complete, self-contained to-do app. It has **exactly one planted bug**. One line.

## Run it

```bash
cd broken
python3 -m http.server 8001
```

Open <http://localhost:8001>. If you've opened this folder before, clear its storage
first: DevTools → Application → Local Storage → delete the `todo-broken` key, then
reload.

## Reproduce the bug

1. Start with an empty list.
2. Add two tasks: `one`, then `two`.
3. Click **Delete** on `two`.

- **Expected:** `one` is still there.
- **Actual:** both tasks vanish.

Related symptom: with both tasks present, ticking the **second** checkbox strikes
through the **first** row.

## Your job

Find the one line. Fix it. **AI off.** Then write `journal/J10.md`:

- the symptom you saw
- how you narrowed it down (what did you `console.log`, and where?)
- the one-line fix, and why it works

Hint, only if you're still stuck after 20 minutes: log `tasks` right after a task is
added, and look hard at the `id` field.
