# Events

Read when curious. Relevant around `W01D5`–`W02D1`.

## The model

Things happen on a page: a click, a form submit, a keypress. Each is an **event**. You
register a function to run when a given event happens on a given element:

```js
element.addEventListener('submit', (event) => { /* ... */ });
```

The function gets an **event object** describing what happened: `event.type`,
`event.target` (the element the event started on), and methods like
`event.preventDefault()`.

## `preventDefault`

Some events have a built-in browser response. A form `submit` navigates the page
(reloading it, or going to the `action` URL). A click on a link follows the link.
`event.preventDefault()` cancels that built-in response so your JavaScript can handle
it instead. On `W01D5` it's what stops the page reloading every time you add a task.

## Bubbling and delegation

When you click the checkbox inside an `<li>` inside `<ul#list>`, the `click` event
fires on the checkbox, then **bubbles up**: to the `li`, to the `ul`, to `body`, to
`document`. A listener on any ancestor sees it.

That's why one listener on `#list` can handle every row:

```js
list.addEventListener('click', (event) => {
  const li = event.target.closest('li');   // which row?
  if (!li) return;
  if (event.target.matches('input[type="checkbox"]')) { /* toggle */ }
  if (event.target.matches('button.delete'))          { /* delete */ }
});
```

- `event.target` — the exact thing clicked.
- `.closest('li')` — walk up to the row it belongs to.
- `.matches(sel)` — was the clicked thing the checkbox, or the button?

This is **event delegation**: one listener on a stable parent, deciding what to do
from `event.target`. It handles rows added *after* the listener was set up — bubbling
doesn't care when the child appeared.

## `defer`

`<script defer src="app.js">` tells the browser: download the script now, but run it
only after the HTML is fully parsed. Without it, a script in `<head>` runs before
`#list` exists, and `querySelector('#list')` returns `null`.
