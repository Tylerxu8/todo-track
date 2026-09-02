# State vs the DOM

Read when curious. Relevant around `W02D2`.

## Two ways to build the same app

**DOM as the source of truth.** There is no `tasks` variable. To know what tasks
exist, you read the `<li>` elements. To know if one is done, you check for a `done`
class. Each handler patches the DOM directly: add builds an `<li>`, toggle flips a
class, delete removes a node.

This works for a while. It breaks when:
- you need the data somewhere the DOM can't go — `localStorage`, a network request, a
  test;
- two things need to stay in sync (the list and a "2 done" counter);
- a feature needs the *whole* list at once (sort, filter, "clear completed").

**State as the source of truth.** One variable holds the data:

```js
let tasks = [];   // [{ id, text, done }, ...]
```

The screen is a **function of that data**:

```js
function render() {
  list.innerHTML = '';
  for (const task of tasks) {
    // build one <li> from `task`, append it
  }
}
```

Every handler does the same two steps: **change `tasks`, then call `render()`.** It
never reads the DOM to make a decision.

## Why the second way scales

- **One direction.** Data flows to the screen, never back. To find a bug you inspect
  one array, not a tree.
- **Trivial persistence.** `JSON.stringify(tasks)` is your whole save format.
- **Testable logic.** "add a task" becomes a function on arrays, with no DOM in sight
  (that's `W02D3` and `W02D5`).
- **Derived values are free.** The counter is `tasks.filter(t => t.done).length`,
  recomputed in `render()`. It can't drift out of sync because it isn't stored.

## The cost

`render()` rebuilds the whole list on every change. For a to-do list that's nothing.
For a 10,000-row grid you'd re-render only what changed — which is, in one sentence,
why libraries like React exist. You don't need one here.
