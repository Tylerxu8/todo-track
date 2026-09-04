# CSS transitions

Read when curious. Relevant around `W03D1`–`W03D3`.

## What it is

A CSS transition tells the browser: "when this property's value changes, don't jump
straight to the new value — animate between the old and new value over some time."

```css
.row-content {
  transition: transform 0.2s ease;
}
```

Three parts:

- **Property** (`transform`) — which CSS property to animate. You can list several,
  comma-separated, or use `transition: all 0.2s ease;` to animate anything that
  changes (convenient, but can animate things you didn't intend).
- **Duration** (`0.2s`) — how long the animation takes.
- **Timing function** (`ease`) — the speed curve over that duration. `ease` starts
  slow, speeds up, ends slow (feels natural for UI). `linear` is constant speed
  (feels mechanical). `ease-in`, `ease-out` are asymmetric versions.

## The trigger

A transition only plays when the property's value actually **changes** while the
transition rule is active — from a CSS class toggling, a hover state, or (as in
`W03D2`) JavaScript setting `element.style.transform` directly. Setting the *same*
value again does nothing.

## The gotcha you hit on W03D2

If you set `transform` on every single `pointermove` event — dozens of times a
second — while a `0.2s` transition is active, each new value starts its own 0.2-second
animation toward it, and they pile up. The element trails behind, always animating
toward wherever your pointer *was* a moment ago rather than where it *is now*. It
feels laggy and springy instead of responsive.

The fix: turn the transition off (`element.style.transition = "none"`) for the
duration of continuous, frequent updates (a drag), then turn it back on
(`element.style.transition = ""`, which falls back to the CSS rule) for the one
final "snap into place" change. That's why `W03D2`'s drag code toggles it on
`pointerdown` and restores it on `pointerup`.

## `transition` vs `animation`

A transition needs a *trigger* (something changes) and only ever goes from A to B.
A CSS `@keyframes` animation can run on its own, loop, and pass through many
intermediate states without anything "changing" from the outside. If you need a
gesture-driven, on-demand effect (like a swipe), transitions are the right tool.
Looping or automatic effects (a pulsing loading indicator) want `animation`.
