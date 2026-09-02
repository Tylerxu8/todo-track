# localStorage

Read when curious. Relevant around `W02D4`.

## What it is

A small key/value store the browser keeps on disk, per origin (per site). It survives
refreshes, tab closes, and browser restarts. Keys and values are **both strings**.

```js
localStorage.setItem('todo-track', '...');   // write
localStorage.getItem('todo-track');          // read -> string, or null if unset
localStorage.removeItem('todo-track');       // delete
```

## Storing objects

It only holds strings, so you serialize:

```js
localStorage.setItem('todo-track', JSON.stringify(tasks));  // array -> string
const tasks = JSON.parse(localStorage.getItem('todo-track')); // string -> array
```

## The two things that bite

1. **`getItem` returns `null` on a first visit.** `JSON.parse(null)` throws. Guard
   with `if (saved)` before parsing.
2. **The stored string can be garbage.** A bug wrote a half object; you edited it in
   DevTools; a browser extension touched it. `JSON.parse` throws on invalid JSON.
   Wrap it:

   ```js
   try {
     tasks = JSON.parse(saved);
   } catch {
     tasks = [];   // corrupt -> start clean, don't white-screen
   }
   ```

## Other limits worth knowing

- **~5 MB** per origin, typically. A text to-do list will never come close.
- **Synchronous.** Reads and writes block the main thread. Fine for small values,
  which is all you have here.
- **Not shared across browsers or devices.** It's local. Syncing would need a server —
  out of scope for this track.
- **Same-origin only.** `localhost:8000` and your GitHub Pages URL have *separate*
  stores. Tasks you add locally won't show up on the deployed site, and that's
  expected.
