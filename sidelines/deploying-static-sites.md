# Deploying a static site

Read when curious. Relevant around `W02D5`.

## What "static" means

Your app is three files — `index.html`, `styles.css`, `app.js` (plus `todo.js`) —
that a browser runs as-is. There's no server code, no database. "Deploying" is just:
put those files on a host that serves them over HTTPS at a public URL.

## GitHub Pages (what the track uses)

1. Push the repo to GitHub.
2. Repo **Settings -> Pages**.
3. **Source:** Deploy from a branch. Pick `main`.
4. **Folder:** `/ (root)` or `/docs`. Pages can't serve an arbitrary `/src` — so
   either move your app files to the repo root, or into `/docs`, and point Pages
   there.
5. Save. First build takes a minute or two. Your URL is
   `https://<username>.github.io/<repo>/`.

## Two things that trip people up

- **Paths.** If `index.html` says `<script src="/app.js">`, the leading `/` means "the
  domain root" — which on Pages is `https://<username>.github.io/`, not your repo
  folder. Use **relative** paths: `src="app.js"`, `href="styles.css"`.
- **Module scripts need a real server.** `<script type="module">` won't load over
  `file://` — that's why `W02D5` uses `python3 -m http.server` locally. GitHub Pages
  *is* a real server, so modules work fine once deployed.

## Checking it

Open the public URL on a device that never ran your local server — your phone is
perfect. Add a task. It should work, and its `localStorage` there is a clean slate
(storage is per-origin, and the Pages URL is a different origin from `localhost`).
