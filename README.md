# Personal Portfolio

A personal portfolio website styled like an IDE / Obsidian: a file-tree
sidebar, tabbed content area with drag-and-drop reordering, light & dark
mode, and an English / German interface.

Content lives as one JavaScript file per page — drop a file in
`src/content/entries/`, give it markdown, and it shows up in the sidebar
with no further wiring.

---

## Tech stack

| Layer        | Choice                                       |
|--------------|----------------------------------------------|
| Build tool   | [Vite](https://vitejs.dev/) 5                |
| UI framework | [React](https://react.dev/) 18               |
| Styling      | [Tailwind CSS](https://tailwindcss.com/) 3 + a small amount of custom CSS for scrollbars and base resets |
| Icons        | [lucide-react](https://lucide.dev/)          |
| Fonts        | JetBrains Mono (UI chrome) + Newsreader (content), loaded from Google Fonts |
| Container    | Multi-stage Docker — Node 20 build, nginx serve |

No state-management library, no router, no markdown library. The
markdown renderer is a small hand-rolled parser in `src/lib/markdown.js`
plus a React component in `src/components/Markdown.jsx`.

---

## Architecture

```
portfolio/
├── Dockerfile              # multi-stage build → nginx
├── nginx.conf              # SPA-friendly server config
├── index.html              # Vite entry; loads Google Fonts
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                    # React bootstrap
    ├── App.jsx                     # top-level state + layout
    ├── icons.js                    # lucide icon registry
    │
    ├── components/                 # one file per component
    │   ├── Sidebar.jsx             # left panel: tree + action bar
    │   ├── TreeNode.jsx            # recursive sidebar row
    │   ├── TabBar.jsx              # tabs + drag-and-drop
    │   ├── ContentView.jsx         # renders the active file
    │   ├── Markdown.jsx            # markdown → JSX
    │   ├── StatusBar.jsx           # bottom strip
    │   ├── SettingsPanel.jsx       # modal: theme/accent/lang
    │   └── WelcomeScreen.jsx       # empty state
    │
    ├── content/                    # all of the SITE'S content
    │   ├── folders.js              # folder definitions
    │   ├── index.js                # auto-discovers entries → builds the tree
    │   └── entries/                # one file per page
    │       ├── readme.js           # dynamic, generated from the tree
    │       ├── bierturnier.js
    │       ├── masters.js
    │       ├── bachelors.js
    │       ├── about.js
    │       └── sports.js
    │
    ├── i18n/
    │   └── translations.js         # UI strings (en / de)
    │
    ├── lib/                        # framework-free helpers
    │   ├── tree.js                 # findNode, getPath, countTree
    │   ├── markdown.js             # block parser (pure)
    │   └── readme.js               # dynamic README generator
    │
    └── styles/
        ├── index.css               # Tailwind layers + base CSS
        └── theme.js                # light/dark palettes, accents, fonts
```

### Data flow

1. `src/content/index.js` calls `import.meta.glob('./entries/*.js', { eager: true })`,
   which Vite turns into an explicit static dependency at build time. Every
   entry file's `default` export becomes a node in the tree.
2. `App.jsx` calls `buildTree()` once on mount, then passes the tree down to
   the sidebar, tab bar, and content view.
3. The active theme (light/dark) and accent color are written onto the root
   element as CSS custom properties. Every component reads them via
   `var(--bg)`, `var(--accent)`, etc. To retune the look, edit the values in
   `src/styles/theme.js` — no component changes needed.

### State

All session state lives in `App.jsx`. By design it does not persist between
reloads. To persist, wire each `useState` initializer to read from
`localStorage` and add a `useEffect` that writes on change.

---

## Local setup

Requires Node 18+ and npm.

```bash
npm install        # install dependencies
npm run dev        # http://localhost:5173 — hot reload
npm run build      # production bundle in ./dist
npm run preview    # preview the production bundle locally
```

---

## Adding content

### Add a page

Create a new file in `src/content/entries/`, e.g. `src/content/entries/travel.js`:

```js
export default {
  id:     'travel',          // unique, kebab-case
  folder: 'personal',        // which folder it lives in (or omit for root)
  order:  3,                 // sort order within that folder
  icon:   'compass',         // optional, key from src/icons.js
  name:   { en: 'Travel', de: 'Reisen' },
  content: {
    en: `# Travel\n\nA paragraph or two.`,
    de: `# Reisen\n\nEin Absatz oder zwei.`,
  },
};
```

Save the file. The dev server picks it up immediately and the README's
auto-generated listing updates.

### Add a folder

Append an entry to `src/content/folders.js`:

```js
{ id: 'writing', order: 4, name: { en: 'Writing', de: 'Schreiben' } }
```

Then create entry files with `folder: 'writing'`.

### Add an icon

Import another icon from `lucide-react` in `src/icons.js` and register it
in `iconMap`. Reference it by key in any entry's `icon` field.

### Markdown supported

`# / ## / ### / ####` headings, `**bold**`, `*italic*`, `` `inline code` ``,
fenced ` ``` ` blocks, `>` blockquotes, `-` / `*` lists, `---` rules, and
`[link text](https://...)`. Anything beyond that won't render.

---

## Configuring links and identity

- GitHub and LinkedIn URLs: edit the constants at the top of
  `src/components/Sidebar.jsx`.
- Site title (browser tab): edit `<title>` in `index.html`.
- Theme palette and accent colors: edit `src/styles/theme.js`.

---

## Docker

The repo includes a multi-stage Dockerfile that builds the bundle with
Node, then serves it with nginx.

```bash
# Build the image
docker build -t portfolio .

# Run it on http://localhost:8080
docker run --rm -p 8080:80 portfolio
```

The nginx config (`nginx.conf`) does a few useful things:

- Falls back to `index.html` for client-side routes (SPA-friendly).
- Caches `/assets/*` for a year (Vite hashes the filenames).
- Marks `index.html` as `no-cache` so deploys are picked up on next visit.
- Enables gzip for text payloads.

To deploy somewhere else (Fly, Cloud Run, Railway, a VPS) the same image
works as-is — it listens on port 80 and serves the built site.

---

## Notes

- The README page in the sidebar is generated dynamically from the tree —
  there's no markdown file behind it. The generator lives in
  `src/lib/readme.js`. Edit the wording there or in
  `src/i18n/translations.js`.
- The drag-and-drop tab reordering uses the native HTML5 DnD API. No
  extra dependency.
- If you'd like more comprehensive markdown (tables, images, syntax-
  highlighted code), swap `src/components/Markdown.jsx` for
  [`react-markdown`](https://github.com/remarkjs/react-markdown) +
  [`remark-gfm`](https://github.com/remarkjs/remark-gfm). The rest of
  the app doesn't care how content is rendered.
