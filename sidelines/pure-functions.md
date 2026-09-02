# Pure functions

Read when curious. Relevant around `W02D3` and `W02D5`.

## Definition

A function is **pure** when:

1. Its return value depends only on its arguments — same inputs, same output, every
   time.
2. It has no side effects — it doesn't change anything outside itself: no writing to
   the DOM, no `localStorage`, no `console.log`, no mutating its arguments.

## Impure vs pure, same job

Impure — reaches out and changes the world:

```js
function addTask(text) {
  tasks.push({ id: nextId++, text, done: false }); // mutates outer `tasks` and `nextId`
  render();                                         // touches the DOM
}
```

Pure — takes everything in, hands one thing back:

```js
function addTask(tasks, text, id) {
  return [...tasks, { id, text, done: false }];     // new array, nothing else touched
}
```

The caller stays in charge of the side effects:

```js
tasks = addTask(tasks, text, nextId++);
render();
```

## Why bother

- **Testable with no setup.** `assert.equal(addTask([], 'x', 1).length, 1)` — no
  browser, no DOM, no fixture. That's the entire reason `W02D5`'s tests are short.
- **No spooky action.** A pure function can't break something on the other side of the
  file. Bugs stay local.
- **Readable.** The signature tells you everything it can do. `remove(tasks, id) ->
  tasks` can't secretly also hit the network.

## "Don't mutate the argument"

`tasks.push(x)` changes the array the caller handed you — they may still be using it.
Return a new one instead:

- add: `[...tasks, newItem]`
- change one: `tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)`
- drop one: `tasks.filter(t => t.id !== id)`

All three give back a fresh array and leave the input untouched.
