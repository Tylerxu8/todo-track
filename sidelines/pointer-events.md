# Pointer Events

Read when curious. Relevant around `W03D2`–`W03D3`, `W03D6`.

## One API for mouse, touch, and pen

Before Pointer Events existed, dragging something meant writing two parallel sets of
handlers: `mousedown`/`mousemove`/`mouseup` for a mouse or trackpad, and
`touchstart`/`touchmove`/`touchend` for a finger — with different event shapes
(`event.clientX` vs `event.touches[0].clientX`) and different edge cases.

**Pointer Events** unify all of that: `pointerdown`, `pointermove`, `pointerup`,
`pointercancel` fire the same way and carry the same properties (`clientX`,
`clientY`, `pointerId`, …) no matter whether the input was a mouse, a finger, or a
stylus. That's why `W03D2`'s swipe code only needed one set of listeners.

## Pointer capture

Normally, an event fires on whatever element is currently under the pointer. If you
`pointerdown` on a row and then drag fast, your pointer can end up over a *different*
element (or outside the browser window entirely) mid-drag — and without extra work,
that element receives `pointermove`, not the one you started dragging.

```js
content.setPointerCapture(event.pointerId);
```

This says: "for this specific pointer (`pointerId`), send all future move/up events
to `content`, no matter where the pointer physically is." It's what lets a drag keep
working even when you move faster than the redraw, or briefly leave the element's
boundaries. Capture is released automatically on `pointerup`/`pointercancel`, or you
can release it early with `releasePointerCapture`.

## `pointerId`

A single interaction (one finger, one mouse button held down) gets a `pointerId` that
stays the same from `pointerdown` through `pointerup`. It matters mainly for
multi-touch: if two fingers are down on the screen at once, they arrive as two
`pointerdown` events with two different ids, and you can track them independently.
This app never needs to — one drag at a time is enough for a to-do list.

## `touch-action`

A CSS property, not a JS API. `touch-action: pan-y` tells the browser "let native
touch-scrolling happen vertically here; I'm handling other directions myself." Without
it, the browser's own gesture handling (rubber-band scrolling, pinch-zoom) can compete
with your JavaScript for the same touch, causing jittery or ignored drags. It's the
touch-specific analogue of calling `event.preventDefault()`.

## `pointer-events` — not the same thing, despite the name

CSS has an unrelated property spelled almost identically:

```css
.overlay { pointer-events: none; }
```

This makes an element **invisible to clicks and hover** entirely — clicks pass
through to whatever's underneath, as if the element weren't there. It has nothing to
do with the Pointer Events *API* above; it just happens to share the word "pointer."
Confusing the two is an easy, common mistake — worth double-checking which one you
mean when you see either name.
