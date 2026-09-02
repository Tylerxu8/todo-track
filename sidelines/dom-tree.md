# The DOM tree

Read when curious. Not paced. Relevant around `W01D2`–`W01D5`.

## What it is

When the browser loads your HTML, it doesn't keep the text of the file around. It
parses it once into a **tree of objects** — the Document Object Model. Every tag
becomes an *element node*. The text inside a tag becomes a *text node*. Nesting in the
HTML becomes parent/child links in the tree.

Your page after `W01D2`, roughly:

```
document
└── html
    ├── head
    │   ├── title  → "Todo" (text node)
    │   └── link
    └── body
        ├── h1  → "Todo" (text node)
        ├── form#new-task
        │   ├── label  → "New task"
        │   ├── input#task-input
        │   └── button  → "Add"
        └── ul#list
            └── li
                ├── input (checkbox)
                ├── span  → "Buy milk"
                └── button.delete  → "Delete"
```

## Why it matters

JavaScript never edits your HTML file. It edits this tree, and the browser re-renders
from the tree. `document.querySelector('#list')` hands you the `ul#list` *object*.
`list.appendChild(li)` adds a child node to it — and the new row appears, because the
screen is a picture of the tree.

## The handful of operations you'll actually use

| Call | Does |
|------|------|
| `document.querySelector(sel)` | first element matching a CSS selector, or `null` |
| `document.createElement('li')` | a new, detached element node |
| `el.textContent = 'x'` | set the element's text (safe — not parsed as HTML) |
| `parent.appendChild(child)` | add `child` as the last child of `parent` |
| `parent.append(a, b, c)` | add several children at once |
| `el.remove()` | detach `el` from the tree |
| `el.closest('li')` | nearest ancestor (or self) matching the selector |
| `el.classList.add / remove / toggle` | change classes |

## Element node vs text node

`<span>Buy milk</span>` is *two* nodes: the `span` element, and a text node "Buy
milk" that is its child. `span.textContent` reads/writes that text node.
`document.createElement` only makes element nodes — you add text with `.textContent`
or by appending a text node.
