# NOTES — a walkthrough of the finished app

Written after the track was done, as a reading guide to the code you actually
shipped. It goes file by file, in plain language, and defines terms as they come up.
If you reread one thing later, reread this alongside the file it describes.

Everything here describes the real state of `docs/app.js`, `docs/todo.js`,
`docs/styles.css`, `docs/index.html`, and `tests/test.js` as of the final commit —
including the places where you went past what the lessons asked for.

---

## 1. The shape of the app

Four files do all the work:

| File | Job |
|------|-----|
| `index.html` | The page's structure — the form, the empty list, the tab bar. Contains no logic. |
| `styles.css` | Everything about how it looks. Contains no logic. |
| `todo.js` | The **pure logic** — small functions that take data in and hand new data back, touching nothing else. No knowledge of the page at all. This is the part `tests/test.js` checks. |
| `app.js` | The **wiring** — reads the page, listens for clicks and drags, calls the `todo.js` functions, and redraws the list. This is the only file that knows both about the page *and* about the data. |

The one idea the whole app is built on: **the screen is a picture of your data.** You
never read a fact off the page to make a decision — you change the data, then call
`render()`, and `render()` makes the page match the data again. Data flows one
direction: your action → change the data → `render()` → screen.

---

## 2. The data model (as it ended up)

### A task

```js
{ id: 1, text: "buy milk", done: false, dueDate: null, flagged: false }
```

An **object** — a bundle of labeled values. Five fields:

- `id` — a number, unique per task, never shown on screen. It exists so code can
  point at one exact task even if two tasks have identical text.
- `text` — a **string** (text), what the user typed, trimmed of surrounding spaces.
- `done` — a **boolean** (only ever `true` or `false`). Flips when the checkbox is
  clicked.
- `dueDate` — a string like `"2026-09-10"`, or `null` when unset. (`null` means
  "deliberately nothing.")
- `flagged` — a boolean, `false` by default. The orange flag.

### A list

```js
{ id: 2, name: "Groceries", tasks: [ {task}, {task}, ... ] }
```

An object holding its own `tasks` **array** (an ordered list). Every task lives
inside exactly one list.

### The whole state

```js
let lists = [ {list}, {list}, ... ];   // every list the user has
let activeListId = 1;                   // which one is on screen right now
```

Plus two counters that only ever go up, so ids are never reused:

```js
let nextTaskId = 1;
let nextListId = 2;
```

That's the entire state of the app. Everything on screen is drawn from these four
variables.

---

## 3. `docs/todo.js` — the pure functions

A **pure function** is like a vending machine: same input always gives the same
output, and using it changes nothing else in the world. Each function here takes an
array, and returns a **brand new** array — it never modifies the one it was given.
That's what makes them safe to test with no browser (see section 6) and safe to
compose (section 4).

The trick they all use: `{ ...t, done: !t.done }` means "make a new object, copy
every field from `t` into it, then overwrite just this one field." `[...arr, x]`
means "make a new array, copy everything from `arr`, then add `x` on the end." The
`...` is called **spread** — "spill everything out into a fresh container."

### Task-level

```js
export function addTask(tasks, text, id) {
  return [...tasks, { id, text, done: false, dueDate: null, flagged: false }];
}
```
Returns a new array: every existing task, plus one new task on the end. The new task
gets all five fields set to their defaults. `export` means other files may `import`
this.

```js
export function toggle(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}
```
`.map` builds a new array by running a function on every item. For each task: "if
this is the one whose id matches, swap in a copy with `done` flipped; otherwise leave
it exactly as it is." A task whose id doesn't match any task means nothing changes —
covered by a test.

```js
export function remove(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}
```
`.filter` builds a new array keeping only the items where the function returns
`true`. Here: keep every task whose id does **not** (`!==`) match.

```js
export function setDueDate(tasks, id, dueDate) {
  return tasks.map((t) => (t.id === id ? { ...t, dueDate } : t));
}

export function toggleFlag(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, flagged: !t.flagged } : t));
}
```
Both are `toggle` with a different field. `setDueDate` takes the new value as an
argument (it's a date the user picked); `toggleFlag` just flips a boolean like
`toggle` does.

### List-level

```js
export function addList(lists, name, id)      // [...lists, { id, name, tasks: [] }]
export function removeList(lists, id)         // lists.filter(l => l.id !== id)
export function findList(lists, id)           // lists.find(l => l.id === id)
```
`addList` and `removeList` are `addTask`/`remove` one level up — same patterns,
applied to the `lists` array instead of a `tasks` array. A new list starts with an
empty `tasks: []`.

`findList` uses `.find`, which returns the first *item* that matches (not a new
array), or `undefined` if nothing matches. It's not strictly "pure" because
`undefined` is a less predictable return — but it still reads its inputs and changes
nothing, so it tests the same way.

```js
export function replaceListTasks(lists, id, tasks) {
  return lists.map((l) => (l.id === id ? { ...l, tasks } : l));
}
```
The connector between the two levels. "Here is a whole new `tasks` array for one
specific list — give me back the whole `lists` structure with that list's tasks
swapped and every other list untouched." `{ ...l, tasks }` keeps the list's `id` and
`name`, replaces only `tasks`. Every task action in `app.js` ends by calling this.

### `reorder` — the one you improved

```js
export function reorder(tasks, draggedId, targetId) {
  const dragged = tasks.find((t) => t.id === draggedId);
  const withoutDragged = tasks.filter((t) => t.id !== draggedId);
  const targetIndex = withoutDragged.findIndex((t) => t.id === targetId);

  const fromIndex = tasks.findIndex((t) => t.id === draggedId);
  const toIndex = tasks.findIndex((t) => t.id === targetId);
  const insertAt = fromIndex < toIndex ? targetIndex + 1 : targetIndex;

  return [
    ...withoutDragged.slice(0, insertAt),
    dragged,
    ...withoutDragged.slice(insertAt),
  ];
}
```

Step by step:

- `dragged` — the task being moved (found by id).
- `withoutDragged` — the array with that task pulled out.
- `.findIndex` returns an item's numeric **position** (0-based), or `-1` if missing.
  `targetIndex` is where the target sits *in the array that no longer contains the
  dragged task*.
- `fromIndex` / `toIndex` are the positions in the **original** array. Comparing them
  tells you the drag direction: `fromIndex < toIndex` means you dragged **downward**.
- `insertAt` is the direction-aware bit. When you drag a task **down** past another,
  you expect it to land *after* that other task, so `targetIndex + 1`. When you drag
  **up**, you expect it to land *before*, so `targetIndex`. The simpler version in
  the lesson always inserts "just before target," which feels wrong for downward
  drags — you fixed that.
- `.slice(0, insertAt)` is everything before the insert point; `.slice(insertAt)` is
  everything from there on. Spread both, with `dragged` sandwiched in the middle, and
  you get one new array with the task moved to the expected spot.

Tests cover both directions (`reorder(start, 3, 1)` and `reorder(start, 1, 2)`).

---

## 4. `docs/app.js` — the wiring, top to bottom

The file runs once, top to bottom, when the page loads. Then it just sits and waits
for events. Here's every section in file order.

### 4.1 Imports and element handles (lines 1–8)

```js
import { addTask, toggle, remove, setDueDate, toggleFlag, findList,
         replaceListTasks, addList, removeList, reorder } from "./todo.js";

const form = document.querySelector("#new-task");
const input = document.querySelector("#task-input");
const list = document.querySelector("#list");
const counter = document.querySelector("#counter");
const savedLists = localStorage.getItem("todo-track-lists");
const savedFlat = localStorage.getItem("todo-track");
```

`import { ... } from "./todo.js"` pulls those named functions in so this file can
call them. The `./` and `.js` are both required in the browser.

`document.querySelector("#new-task")` searches the whole page and returns the first
element matching that CSS selector (`#id`, `.class` — same language as `styles.css`).
These four `const`s are permanent handles onto elements that already exist — grabbed
once, reused everywhere. `const` = "this name never gets reassigned."

`localStorage` is a small on-disk store the browser gives each site; it survives
refreshes and restarts. It only holds **strings**. `getItem` returns the stored
string, or `null` if that key was never written. Two keys are read: the new
multi-list format (`todo-track-lists`) and the old flat format from before Week 3
(`todo-track`).

### 4.2 State variables (lines 10–13)

```js
let lists = [];
let activeListId = 1;
let nextListId = 2;
let nextTaskId = 1;
```

`let` (not `const`) because every one of these gets reassigned as the app runs.
These four hold the entire state — see section 2.

### 4.3 Load and migrate (lines 15–36)

```js
if (savedLists) {
  try {
    const parsed = JSON.parse(savedLists);
    lists = parsed.lists;
    activeListId = parsed.activeListId;
  } catch {
    lists = [{ id: 1, name: "My List", tasks: [] }];
  }
} else if (savedFlat) {
  try {
    const oldTasks = JSON.parse(savedFlat);
    lists = [{ id: 1, name: "My List", tasks: oldTasks }];
  } catch {
    lists = [{ id: 1, name: "My List", tasks: [] }];
  }
} else {
  lists = [{ id: 1, name: "My List", tasks: [] }];
}
```

Three cases, checked in order, only one runs:

1. **`if (savedLists)`** — the new format exists. `JSON.parse` turns the stored
   string back into a real object. Read `lists` and `activeListId` out of it.
2. **`else if (savedFlat)`** — no new format, but the *old* flat format is there.
   This is the **migration**: take the entire old flat array of tasks and drop it,
   as-is, inside one new list called "My List." Nothing is lost — the tasks are just
   re-homed one level deeper. This branch runs exactly once, the first time the
   Week-3 code meets a pre-Week-3 save.
3. **`else`** — neither exists. Brand-new user. Start with one empty list.

Each reading branch is wrapped in `try { ... } catch { ... }`. `JSON.parse` throws an
error if the stored text is corrupt (a half-write, something hand-edited in DevTools).
Normally an error stops the whole script. `try` means "if this fails, jump to `catch`
instead of crashing" — and `catch` here just starts clean with one empty list. A
blank app beats a broken one.

Note: the old `todo-track` key is **never deleted**. If the migration had a bug, the
original data is still sitting there, recoverable.

```js
const allIds = lists.flatMap((l) => l.tasks.map((t) => t.id));
nextTaskId = Math.max(0, ...allIds) + 1;
nextListId = Math.max(0, ...lists.map((l) => l.id)) + 1;
```

After loading, the counters must be set higher than anything already in use, or
you'd hand out a duplicate id. `.flatMap` is `.map` that also flattens one level — it
collects every task id from every list into one flat array of numbers.
`Math.max(0, ...allIds)` spreads that array into arguments (`Math.max(0, 1, 2, 5)`)
and returns the biggest; `+ 1` is the next free id. The `0` is a floor: `Math.max()`
with nothing returns negative infinity, so an empty list would otherwise set the
counter to that.

### 4.4 Helper functions (lines 38–48)

```js
function todayString() {
  return new Date().toISOString().slice(0, 10);
}
```
Today's date as `"YYYY-MM-DD"`. That format sorts correctly with a plain `<`
comparison (year, then month, then day, all zero-padded), which is how overdue
detection works in `render()`.

```js
function currentTasks() {
  return findList(lists, activeListId).tasks;
}
function updateCurrentTasks(newTasks) {
  lists = replaceListTasks(lists, activeListId, newTasks);
}
```
The glue between the multi-list state and the single-array pure functions.
`currentTasks()` digs the active list's `tasks` array out of `lists`.
`updateCurrentTasks(newTasks)` slots a new array back into the active list. Every
handler follows the shape:

```js
updateCurrentTasks( someFunction( currentTasks(), ... ) );
```

Read inside-out: get the current array → run a pure function on it → put the result
back. The pure functions in `todo.js` never had to learn about `lists` — this is why
writing them to take a plain array argument paid off.

### 4.5 `renderTabs()` (lines 50–72)

Rebuilds the tab bar from `lists` every time it's called (`innerHTML = ""` wipes it
first, then the loop rebuilds). For each list it makes a `<button>` with:

- the list's `name` as text,
- a `<span class="tab-x">×</span>` appended inside — the delete-this-list affordance
  (this whole delete-a-list flow is something you built; the lesson left it as an
  optional stretch),
- `className` set to `"tab active"` for the active list, `"tab"` for the rest — using
  a **ternary**: `condition ? valueIfTrue : valueIfFalse`, a compact if/else that
  produces a value,
- `dataset.listId = l.id` — writes `data-list-id="2"` on the button, an invisible
  attribute the click handler reads back later.

Then one more button, `id="add-list"`, showing `+`.

### 4.6 `render()` (lines 74–131) — the big one

This is the only function that writes to `<ul id="list">`. It runs after every
action.

```js
list.innerHTML = "";
for (const task of currentTasks()) {
  ...
}
```
Wipe the list, then loop once per task in the active list. `for (const task of ...)`
runs the body once per item, with `task` being the current one each time round.

Inside the loop, each row is built up piece by piece and then assembled into two
stacked layers. Working outward:

- `li` — the row. `li.dataset.id = task.id` tags it. `li.draggable = true` lets the
  browser's drag-and-drop pick it up (used in 4.13). `if (task.done)
  li.classList.add("done")` adds the class that drives the strikethrough CSS.
- `checkWrap` — a `<label class="check">` wrapping the real `<input type="checkbox">`
  and a `<span class="check-circle">`. `checkbox.checked = task.done` sets the tick
  state **from the data**, so after a full rebuild it's still right. The circle is
  pure decoration; CSS makes it look filled when the (invisible) checkbox is checked.
- `span` — `<span>` with `textContent = task.text`. `textContent` (not `innerHTML`)
  means the user's text is shown as literal characters, never interpreted as HTML.
- `dateInput` — `<input type="date" class="due-date">`. `value = task.dueDate || ""`
  — `||` falls back to `""` if `dueDate` is `null` *or* `undefined` (an old task
  missing the field), so both cases render a blank picker.
- `isOverdue = task.dueDate && !task.done && task.dueDate < todayString()` — three
  `&&` ("and") checks, left to right, and it short-circuits: if `task.dueDate` is
  missing (falsy), the rest never runs, so there's no risk of comparing `undefined`
  to a date. Meaning: has a date, AND not done, AND the date is before today. If so,
  `dateInput.classList.add("overdue")` turns it red.
- `flagBtn` — `<button class="flag">⚑</button>`, gets `flagged` class (orange) when
  `task.flagged`.
- `del` — `<button class="delete">Delete</button>`.

Then the two layers:

```js
const actions = document.createElement("div");
actions.className = "row-actions";
actions.appendChild(del);

const content = document.createElement("div");
content.className = "row-content";
content.append(checkWrap, span, dateInput, flagBtn);

li.append(actions, content);
list.appendChild(li);
```

- `.row-actions` sits underneath, holding just the Delete button.
- `.row-content` sits on top, holding everything the user normally sees.
- On touch devices, `.row-content` slides left to reveal `.row-actions` (the swipe).
  On desktop, CSS lays them out as a normal row instead (section 5).
- `li.append(actions, content)` — order matters: later siblings paint on top, so
  `content` covers `actions` until swiped.

After the loop:

```js
const doneCount = currentTasks().filter((t) => t.done).length;
counter.textContent = `${currentTasks().length} tasks · ${doneCount} done`;
save();
```
The counter is recomputed from the data every render, so it can't drift out of sync.
The backtick string is a **template literal** — `${...}` drops live values into text.
`save()` is called here, so every action that ends in `render()` also persists.

### 4.7 `save()` (lines 133–138)

```js
localStorage.setItem("todo-track-lists", JSON.stringify({ lists, activeListId }));
```
`JSON.stringify` turns the state object into a plain string; `setItem` writes it
under the new-format key. `{ lists, activeListId }` is shorthand for
`{ lists: lists, activeListId: activeListId }`.

### 4.8 Submit handler — add a task (lines 140–153)

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (text === "") return;

  updateCurrentTasks(addTask(currentTasks(), text, nextTaskId));
  nextTaskId += 1;
  render();
  renderTabs();

  input.value = "";
  input.focus();
});
```

`addEventListener("submit", fn)` registers `fn` to run whenever the form is
submitted (Enter in the field, or the Add button). `event.preventDefault()` cancels
the browser's built-in "reload the page with the form data in the URL" behavior.
`input.value.trim()` is the typed text without surrounding spaces; `if (text === "")
return;` is a **guard clause** — bail out early on empty input. Then the standard
pattern: `addTask` on `currentTasks()`, put the result back, bump the counter,
redraw, clear and refocus the box.

### 4.9 Change handler — due dates (lines 155–165)

```js
list.addEventListener("change", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.matches(".due-date")) {
    updateCurrentTasks(setDueDate(currentTasks(), id, event.target.value || null));
    render();
    renderTabs();
  }
});
```

One `change` listener on the whole `<ul>` — **event delegation**: a click or change
inside a child bubbles up to the parent, so one listener covers every row, including
rows added later. `event.target` is the exact element changed; `.closest("li")`
walks up to the row it's in; `.matches(".due-date")` checks it was the date input.
`event.target.value || null` converts an emptied picker (`""`) back to `null` so it
round-trips through storage cleanly. `Number(li.dataset.id)` — dataset values are
strings, and `===` treats `"3"` and `3` as different.

### 4.10 Click handler on the list — check / delete / flag (lines 167–190)

```js
list.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.matches('input[type="checkbox"]')) {
    updateCurrentTasks(toggle(currentTasks(), id));  render(); renderTabs();
  }
  if (event.target.matches("button.delete")) {
    updateCurrentTasks(remove(currentTasks(), id));  render(); renderTabs();
  }
  if (event.target.matches(".flag")) {
    const id = Number(event.target.closest("li").dataset.id);
    updateCurrentTasks(toggleFlag(currentTasks(), id));  render(); renderTabs();
  }
});
```

Same delegation pattern. Three `if`s, one per kind of thing that can be clicked in a
row. Each does the inside-out sandwich (`currentTasks()` → pure function → put back),
then redraws. (The flag branch re-reads `id` into its own local — harmless, the outer
`id` would have worked too.)

### 4.11 Click handler on the tab bar (lines 192–219)

```js
document.querySelector("#list-tabs").addEventListener("click", (event) => {
  if (event.target.matches(".tab-x")) {
    if (lists.length <= 1) return;
    const id = Number(event.target.closest(".tab").dataset.listId);
    const list = findList(lists, id);
    if (!confirm(`Delete "${list.name}" and its tasks?`)) return;
    lists = removeList(lists, id);
    if (activeListId === id) activeListId = lists[0].id;
    render();
    renderTabs();
    return;
  }
  if (event.target.matches(".tab")) {
    activeListId = Number(event.target.dataset.listId);
    render(); renderTabs();
  }
  if (event.target.id === "add-list") {
    const name = prompt("List name?");
    if (!name || !name.trim()) return;
    lists = addList(lists, name.trim(), nextListId);
    nextListId += 1;
    activeListId = nextListId - 1;
    render(); renderTabs();
  }
});
```

Three branches:

- **`.tab-x`** (the `×`) — delete a list. `if (lists.length <= 1) return;` refuses to
  remove the last one. `confirm(...)` pops a native OK/Cancel dialog and returns
  `true`/`false`; `if (!confirm(...)) return;` bails on Cancel. `removeList` drops the
  list. `if (activeListId === id) activeListId = lists[0].id;` — if you just deleted
  the list you were looking at, jump to the first remaining one. The `return` at the
  end stops the other branches from also running for this click.
- **`.tab`** — switch lists. Just set `activeListId` and redraw.
- **`#add-list`** (the `+`) — `prompt(...)` pops a native text-input dialog and pauses
  until you answer. Guard against empty/whitespace, then `addList`, bump `nextListId`,
  make the new list active.

`prompt` and `confirm` are quick, unstyled, entirely legitimate here — no markup
needed, they block until answered. A polished product would build custom dialogs;
skipping that for a to-do app is a fair call.

### 4.12 Swipe-to-delete — touch only (lines 221–256)

```js
const OPEN_X = -88;
let drag = null;

list.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch") return;
  const content = event.target.closest(".row-content");
  if (!content) return;
  if (event.target.closest("input, button")) return;

  drag = { content, startX: event.clientX, currentX: 0 };
  content.style.transition = "none";
  content.setPointerCapture(event.pointerId);
});
```

**Pointer Events** (`pointerdown`/`move`/`up`) are one API that covers mouse, touch,
and pen. Three guards at the top of `pointerdown`, and they're the reason swipe and
desktop drag-to-reorder don't fight each other:

- `if (event.pointerType !== "touch") return;` — **only start a swipe on a real
  touch.** On a desktop with a mouse, this handler does nothing at all, leaving the
  mouse free for drag-to-reorder (4.13). This is the fix for the conflict the lesson
  only names as an open limitation.
- `if (!content) return;` — the press wasn't on a row's content layer.
- `if (event.target.closest("input, button")) return;` — don't start a swipe when the
  press lands on the checkbox, date picker, flag, or delete button; those need their
  own taps.

Then: record the drag (`startX` is where the finger went down), turn the CSS
transition off so the row tracks the finger *exactly* instead of lagging behind an
animation, and `setPointerCapture` so move/up events keep coming to this element even
if the finger slides off it.

```js
list.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const delta = event.clientX - drag.startX;
  drag.currentX = Math.min(0, Math.max(OPEN_X, delta));
  drag.content.style.transform = `translateX(${drag.currentX}px)`;
});
```
`delta` is how far the finger has moved sideways. `Math.min(0, Math.max(OPEN_X,
delta))` **clamps** it: never past `OPEN_X` (-88, fully open) on the left, never past
`0` on the right. `transform: translateX(...)` shifts the content layer without
disturbing anything around it.

```js
list.addEventListener("pointerup", (event) => {
  if (!drag) return;
  drag.content.style.transition = "";
  const open = drag.currentX < OPEN_X / 2;
  drag.content.style.transform = `translateX(${open ? OPEN_X : 0}px)`;
  drag = null;
});

list.addEventListener("pointercancel", () => {
  if (!drag) return;
  drag.content.style.transition = "";
  drag = null;
});
```
On release: turn the transition back on (so the snap animates), then snap fully open
if the drag passed halfway, otherwise snap closed. `drag = null` ends the gesture.
`pointercancel` (the OS steals the gesture — an incoming call, a system swipe) just
resets cleanly.

### 4.13 Drag-to-reorder — desktop (lines 258–282)

```js
list.addEventListener("dragstart", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  event.dataTransfer.setData("text/plain", li.dataset.id);
  event.dataTransfer.effectAllowed = "move";
});

list.addEventListener("dragover", (event) => {
  event.preventDefault();
});

list.addEventListener("drop", (event) => {
  event.preventDefault();
  const targetLi = event.target.closest("li");
  if (!targetLi) return;
  const draggedId = Number(event.dataTransfer.getData("text/plain"));
  const targetId = Number(targetLi.dataset.id);
  if (draggedId === targetId) return;
  updateCurrentTasks(reorder(currentTasks(), draggedId, targetId));
  render();
  renderTabs();
});
```

This is the **HTML5 Drag and Drop API** — different from Pointer Events, built for
dragging elements around, and mouse-oriented (which is why swipe was made
touch-only — they don't overlap).

- `dragstart` — fires on the row you begin dragging (rows are `draggable` from
  `render()`). `dataTransfer` is a clipboard-like object that carries data from the
  start of a drag to wherever it ends, even across tabs. Store the dragged row's id
  as text. `effectAllowed = "move"` picks the cursor icon.
- `dragover` — fires constantly while dragging over something. Its *only* job here is
  `event.preventDefault()`. Without it, the browser's default assumption is "this is
  not a valid drop target" and `drop` never fires. This is the most-searched
  drag-and-drop bug there is.
- `drop` — read the dragged id back out of `dataTransfer`, find the target row's id,
  ignore a drop onto itself, then run `reorder` (section 3, the direction-aware one)
  and redraw.

### 4.14 The bottom of the file (lines 284–285)

```js
render();
renderTabs();
```
Draw everything once on load, after all the state has been loaded/migrated. From
here the file is idle, and only the event listeners above ever run again.

---

## 5. `docs/styles.css` — the parts worth knowing

Most of it is ordinary spacing and color. The pieces that carry real ideas:

- **`box-sizing: border-box` on `*`** (line 1) — makes `width` include padding and
  border instead of adding them on top. Standard first line of any stylesheet.
- **The grouped card** (`#list`) — `background: white; border-radius: 10px;
  overflow: hidden;` on a `#f2f2f7` grey body. `overflow: hidden` is what clips the
  first/last rows to the rounded corners. (Note: `body` is declared three times in a
  row here — harmless, they stack, but it could be one block.)
- **The inset divider** (`#list li::after`) — instead of a `border-bottom` on the row
  (which would span full width), an absolutely-positioned pseudo-element with
  `left: 3rem; right: 0` draws a line that starts after the checkbox.
  `:last-child::after { display: none }` removes it under the final row.
- **The custom checkbox** — the real `<input>` is `opacity: 0` (invisible but still
  fully functional and keyboard-reachable — *not* `display: none`, which would remove
  it from tab order). `.check input:checked + .check-circle` styles the decorative
  circle based on the hidden checkbox's state — `+` means "the sibling immediately
  after," which is why the markup order (checkbox, then circle) matters. The
  checkmark is a rotated two-sided border, centered with flexbox on `.check-circle`.
- **`#list li span { min-width: 0 }`** — a flexbox gotcha fix. Flex items refuse to
  shrink narrower than their content by default, which makes long task text overflow
  the row; `min-width: 0` lets it shrink and wrap.
- **Two layers per row** — `.row-actions` is `position: absolute; inset: 0` (fills the
  row, sits behind), `.row-content` paints on top with a white background.
  `transform: translateX(0)` + `transition: transform 0.2s ease` is the resting state
  and the snap animation. `.row-actions:focus-within + .row-content { transform:
  translateX(-88px) }` reveals the delete button when it's focused by keyboard — the
  accessible equivalent of swiping.
- **The two media queries — this is the clever part.** They give touch and desktop
  *different* delete interfaces:
  - `@media (pointer: coarse)` — touch devices — gives the date input a visible
    border and bigger tap target.
  - `@media (hover: hover) and (pointer: fine)` — desktop with a mouse — **turns the
    swipe mechanism off entirely.** `.row-content { transform: none }`,
    `.row-actions { position: static; order: 1 }`, and the row becomes a plain
    flexbox row with the Delete button shown as an always-visible grey text button on
    the right. So: touch users swipe to reveal a red Delete; mouse users just click a
    visible Delete. The JS `pointerType !== "touch"` guard and this CSS work together
    to keep swipe and drag-to-reorder from colliding.

---

## 6. `tests/test.js` — what's checked and how

Run it:

```
node tests/test.js
```

A **unit test** calls a function with a known input and asserts the result is exactly
what you expect. `assert.equal(a, b)` throws if `a !== b`; `assert.deepEqual(a, b)`
compares arrays/objects by contents rather than by identity. A throw stops that test
and prints expected-vs-actual — that's the failure signal.

The file has a tiny `test(name, fn)` helper that runs `fn`, counts it, and logs
`ok - <name>`. If any assertion inside throws, the count stops and the error halts
the file.

Coverage (26 tests):

- Every `todo.js` function has a "does the right thing" test **and** a "does not
  mutate its input" test.
- The "id that doesn't exist" edge case for `toggle`, `remove`, `removeList`,
  `findList`.
- `replaceListTasks` — updates the right list, keeps other fields, keeps other lists,
  doesn't mutate.
- An integration test: `findList` + `addTask` + `replaceListTasks` together add a
  task to the right list only — this mirrors exactly what `app.js`'s handlers do.
- `reorder` in both directions (up and down).

Nothing about the DOM, events, `localStorage`, or `render()` is tested — those need a
browser. Only the pure logic in `todo.js` is covered, which is the point of having
split it out.

---

## 7. `docs/index.html` — the hooks

No logic. It provides the elements the CSS and JS attach to:

- `<div id="list-tabs">` — filled by `renderTabs()`.
- `<form id="new-task">` with `<input id="task-input">` and a submit button — the
  submit handler listens here.
- `<p id="counter">` — filled by `render()`.
- `<ul id="list">` — filled by `render()`.
- `<script type="module" src="app.js">` — `type="module"` because `app.js` uses
  `import`. Modules wait for the page to finish loading on their own, so no `defer`
  needed. (This also means the app must be opened through a web server, not a
  `file://` path — locally, `cd docs && python3 -m http.server 8000`.)

---

## 8. What you did beyond the lessons

Worth remembering these were your calls, not the script's:

1. **Direction-aware `reorder`** (`fromIndex < toIndex ? targetIndex + 1 :
   targetIndex`) — a task dragged down lands *after* the target, dragged up lands
   *before*. The lesson's version always inserts before.
2. **Swipe restricted to touch** (`pointerType !== "touch"` in JS, plus the desktop
   media query in CSS) — so swipe-to-delete and mouse drag-to-reorder never fight.
   The lesson leaves this as a stated, unsolved limitation.
3. **A full delete-a-list flow** — the `×` on each tab, `confirm()`, the last-list
   guard, reassigning `activeListId`. The lesson leaves list deletion as an optional,
   unscripted stretch.
4. **A `pointercancel` handler** — resets a swipe cleanly if the OS takes the
   gesture. Not in the lesson.
5. **Desktop vs. touch delete UI** via `@media (hover: hover)` — a plain visible
   Delete button on desktop, the red swipe target on touch.
6. **`min-width: 0`** on the task text — the flexbox-overflow fix.
7. **More tests than asked** — non-mutation coverage on every function, plus the
   integration test.

---

## 9. Known limitations (still true)

- **Reorder is desktop-only.** Touch reorder would need a press-and-hold gesture
  built on Pointer Events, like the swipe. Not built.
- **Everything is per-browser.** `localStorage` doesn't sync between devices or
  browsers. Two people opening the deployed URL get two separate, private lists.
- **No undo.** Delete is immediate. `confirm()` on list deletion is the only safety
  net.
- **An open swipe row doesn't auto-close** when you interact elsewhere — it stays
  open until you tap it or swipe it back.
- **`prompt()` / `confirm()` dialogs** are unstyled browser defaults.
