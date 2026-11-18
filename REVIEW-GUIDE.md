# Moodora — Codebase Reading Guide

Written for someone who did **not** write this code. Read it top-to-bottom the first time;
afterwards use it as a map.

---

## 0. The 30-second version

Moodora is a **frontend-only demo app** (no backend, no accounts, no database) that acts like a
"creative studio". It does 4 things:

1. **Feed planner** — drag-and-drop a 3x3 Instagram-style grid (`/planner`)
2. **Collage studio** — a real editing canvas with layers, undo/redo, PNG/JPEG export (`/collage`)
3. **Mood library** — browse 15 "aesthetic" mood boards, favorite them (`/explore`)
4. **My projects** — save/re-open feeds and collages (`/projects`)

**Everything is stored in the browser** (localStorage + IndexedDB). The login/register screen is a
*sketch* — it just writes a fake session to localStorage. There is no server call anywhere in the app.

Repo shape: a **pnpm monorepo** scaffolded by Replit. Only ONE package actually produces the product
you see: `artifacts/moodora`. Everything else is scaffolding.

---

## 1. Repo map — what each folder is

| Path | What it is | Do you need it? |
|---|---|---|
| `artifacts/moodora/` | **THE APP.** The whole product lives here. | Yes — 100% |
| `artifacts/moodora/src/App.tsx` | **The heart.** One 604-line file containing every page, all state, all UI. | Yes |
| `artifacts/moodora/src/lib/local-assets.ts` | IndexedDB helper for storing uploaded photos. | Yes |
| `artifacts/moodora/src/index.css` | All styling: theme colors + the custom classes (`.btn`, `.card`, `.field`...). | Yes |
| `artifacts/moodora/src/components/ui/` | 55 shadcn/ui components — **almost all unused leftovers**. | Skim only |
| `artifacts/mockup-sandbox/` | Replit's tool to preview UI components in isolation. Not part of the product. | Ignore |
| `artifacts/api-server/` | Express 5 skeleton with a single `/api/healthz` route. **The app never calls it.** | Ignore (for now) |
| `lib/db/` | Drizzle ORM + Postgres config. The schema file is **empty** (comments only). | Ignore |
| `lib/api-spec/` | `openapi.yaml` with only a health-check endpoint + Orval codegen config. | Ignore |
| `lib/api-zod/`, `lib/api-client-react/` | **Auto-generated** code from that OpenAPI spec. | Ignore |
| `scripts/` | `hello.ts` template + Replit `post-merge.sh`. | Ignore |
| `pnpm-workspace.yaml` | Defines workspace packages + pins dependency versions ("catalog"). | Read once |
| `replit.md` | Replit's template notes. **Still mostly unfilled placeholders.** | Skim |
| `.replit`, `**/.replit-artifact/artifact.toml` | How Replit builds/runs/serves each artifact (ports, build commands). | Read once |

> **Key insight:** the "real" code is ~700 lines total (`App.tsx` + `local-assets.ts` + `index.css`).
> ~180 files exist, but most are generated or unused. Don't be intimidated by the file count.

---

## 2. How to run it (and the two traps that will bite you)

Prereqs: Node 18+ (you have v26) and **pnpm** (install with `npm i -g pnpm` or `corepack enable pnpm`).

```powershell
cd c:\amand\Amie\Moodora-frontend\Moodora-frontend
pnpm install
pnpm --filter @workspace/moodora run dev
```

**Trap 1 — required env vars.** `artifacts/moodora/vite.config.ts` *throws an error at startup* if
`PORT` and `BASE_PATH` are missing. Replit injects them automatically (see
`artifacts/moodora/.replit-artifact/artifact.toml` → `PORT=20115`, `BASE_PATH=/`); on your own machine
you must set them yourself:

```powershell
$env:PORT='20115'; $env:BASE_PATH='/'
pnpm --filter @workspace/moodora run dev
# then open http://localhost:20115
```

**Trap 2 — the scripts are Linux-only.** The npm scripts contain `export NODE_ENV=...` (bash syntax)
and the root `preinstall` is a `sh -c` script. On Windows, either run the underlying commands directly
(as above) or use WSL/Git Bash. `pnpm install` may need `--ignore-scripts` if `preinstall` fails.

Useful checks: `pnpm run typecheck` (whole monorepo), `pnpm --filter @workspace/moodora run build`.

---

## 3. The reading sequence (do it in this order)

### Step 1 — Get the shape of the app (5 min)
- `replit.md` — what the template claims the stack is.
- `pnpm-workspace.yaml` — the list of packages + the pinned versions ("catalog:").
- `artifacts/moodora/.replit-artifact/artifact.toml` — port **20115**, served as static files,
  `/*` rewrites to `/index.html` (this is why client-side routing works on refresh).

### Step 2 — The entry point (5 min)
- `artifacts/moodora/index.html` — a bare `<div id="root">` + `<script src="/src/main.tsx">`.
- `artifacts/moodora/src/main.tsx` (17 lines) — mounts `<App/>` inside an `ErrorBoundary`.
- `artifacts/moodora/src/components/error-boundary.tsx` — the safety net that catches React crashes.
- `artifacts/moodora/vite.config.ts` — the `@` alias points at `src/`, so `@/components/...` resolves.

### Step 3 — Routing = the table of contents (10 min) ★ IMPORTANT
`App.tsx` lines **85–144** (`AppContent`, `navPrimary`, `Shell`).
Read this first among the app code: it shows the site branches into **landing** (`/`) →
**public** (`/login`, `/register`) → **app shell** (everything else), and lists every route.
The router is **wouter** (a tiny react-router alternative).

Routes: `/` `/login` `/register` `/dashboard` `/planner` `/collage` `/explore` `/projects`
`/profile` `/settings` + a catch-all 404.

### Step 4 — State + persistence (15 min) ★ IMPORTANT
`App.tsx` lines **62–83**:
- `read(key, fallback)` / `write(key, value)` — tiny localStorage JSON helpers used everywhere.
- `useStudioStore` — a **zustand** store (global state) holding `projects`, `aesthetics`, `name`.
  Every setter also writes to localStorage, so state survives a refresh.
Then read `src/lib/local-assets.ts` — an **IndexedDB** helper that stores the *original uploaded image*
(Blob). localStorage is too small for photos, so only a small JPEG preview lives there.

### Step 5 — The landing page + mock auth (10 min)
- `App.tsx` lines **146–193**: `Landing` + `FeatureCard`. Pure presentation, good for reading JSX.
- lines **195–216**: `AuthPage` + `authSchema` (zod). Notice it never calls an API — it writes
  `moodora.session` to localStorage and navigates. There's even a "Continue as a guest" button.

### Step 6 — The dashboard (10 min)
`App.tsx` lines **218–244**: `PageHeading`, `saveProject`, `Dashboard`, `Stat`, `ProjectTile`.
This is where you learn the app's **visual vocabulary** (`PageHeading`, `Stat`, `ProjectTile`, the
`.card` class) that every other page reuses.

### Step 7 — Feed planner (20 min) ★ the friendliest "real feature"
`App.tsx` lines **247–294**: `SortableFeedItem` + `Planner`.
Teaches **@dnd-kit** drag-and-drop: `DndContext` / `SortableContext` / `useSortable` / `arrayMove`.
Also shows an export trick: drawing the grid onto an offscreen `<canvas>` to download a PNG.

### Step 8 — Collage studio (45 min, the deep end) ★ biggest + hardest
`App.tsx` lines **296–510**:
- 296–328: `layoutOptions`, `canvasFormats` (Square/Portrait/Story) and `gridCells()` — pure geometry
  returning cell rects as percentages. Great "read one function carefully" practice.
- 329–394: **fabric.js** canvas setup (created once; listens for `selection:*` and `object:modified`).
- 395–427: the "render layers → canvas" effect. Key idea: the **`layers` array is the source of
  truth**; the canvas is only a *view* of it.
- 428–462: actions — add photos, upload (uses `local-assets`), add text/shapes, undo/redo, save, export.
- 463–510: the 3-column UI (tools | canvas | properties).

**New concepts here:** refs (`useRef`), `useEffect` dependencies, async/await, image-scale math,
custom undo/redo stacks, canvas export.

### Step 9 — Library, projects, profile, settings (20 min)
- 512–539 `Explore` — search + category pills + favorite (heart) toggle, plus a detail modal.
  Favorites are written back through the zustand store (`moodora.aesthetics`), and `/profile` shows them.
- 541–564 `Projects` — list/search/re-open/delete saved projects. "Open" writes `moodora.openProject`
  to localStorage then navigates; `Collage`/`Planner` read that key on mount (an easy hand-off pattern).
- 566–579 `Profile` — edit display name / email.
- 580–595 `Settings` — theme (toggles the `.dark` class on `<html>`), compact cards, **clear all local data**.
- 596 `NotFound`; 598–602 `App` — the provider stack:
  `QueryClientProvider → TooltipProvider → wouter Router → ErrorBoundary`.

### Step 10 — Styling (15 min)
`artifacts/moodora/src/index.css`:
- lines 1–3: Google Fonts + Tailwind v4 import.
- lines 5–58: CSS variables for the light/dark theme (shadcn convention).
- lines 59–98: the hand-written classes the app actually uses — `.btn`, `.btn-dark`, `.btn-olive`,
  `.card`, `.field`, `.pill`, `.eyebrow`, `.page-title`, `.side-nav`, `.toast-note`, `.fade-in`.
- lines 99–146: responsive `@media` rules that re-flow the landing hero, planner and collage layouts
  on small screens (`.collage-layout`, `.feature-grid`, `.dashboard-hero`, ...).
- lines 147–158: hover polish, the `.dark` overrides, and fabric.js canvas sizing.
- Note: most components use **inline `style={{...}}`** rather than Tailwind classes. That's how the
  code was generated — expect it and don't fight it.

### Step 11 — The Replit extras (15 min, optional)
- `artifacts/api-server/src/app.ts` + `src/routes/` — Express server with `pino-http` logging plus one
  route: `GET /api/healthz`. Nothing in the frontend calls it.
- `lib/api-spec/openapi.yaml` → `lib/api-client-react` + `lib/api-zod`, generated by **Orval**.
- `lib/db/src/schema/index.ts` — an empty Drizzle schema (comments only).
- `artifacts/mockup-sandbox/src/App.tsx` — the component-preview harness.

### Step 12 — Config files (10 min)
`tsconfig.base.json`, `tsconfig.json`, `artifacts/moodora/tsconfig.json` (path aliases),
`artifacts/moodora/components.json` (shadcn config).

### Step 13 — Version control (5 min)
`git log --oneline -n 30` then `git show --stat <commit>`. Commits are the cheapest way to see what
changed and in what order.

### Step 14 — Run it and click through every route
With the dev server up, follow the same order as the routes: landing → register → dashboard → planner →
collage → explore → projects → profile → settings. Then open DevTools → **Application → Local Storage**
and watch the `moodora.*` keys appear as you use the app.

---

## 4. Mini glossary (the words the code uses)

| Term | Plain meaning |
|---|---|
| **Vite** | Build tool + dev server. `pnpm dev` = "start the dev server". |
| **React component** | A function returning JSX (HTML-looking markup), e.g. `function Dashboard(){...}`. |
| **Hook** | A `useXxx()` function giving a component memory/behaviour: `useState` (data), `useEffect` (side effects), `useRef` (a mutable box that survives re-renders), `useLocation` (current URL). |
| **zustand** | Tiny global-state library. `useStudioStore()` reads/writes the shared store. |
| **wouter** | Tiny router. `<Route path="/collage">` + `<Link href="...">`. |
| **shadcn/ui** | Copy-pasted UI components (Radix + Tailwind) living in `components/ui/`. |
| **Tailwind CSS v4** | Utility CSS framework — mainly used here by the pre-built `ui/` components. |
| **fabric.js** | Canvas library powering the collage editor (objects you can move/scale/rotate). |
| **@dnd-kit** | Drag-and-drop library powering the feed planner. |
| **zod** | Schema validation (used for the auth form and the generated API types). |
| **localStorage** | Small browser key/value store (~5 MB). Holds the `moodora.*` JSON. |
| **IndexedDB** | Larger browser database. Holds the original uploaded image files. |
| **pnpm workspace** | Monorepo tool. `workspace:*` means "use the local sibling package". |
| **artifact** | Replit's word for one deployable app in the repo (`moodora`, `api-server`, ...). |
| **typecheck** | Running the TypeScript compiler to find type errors without building. |

---

## 5. Where the data actually lives (state map)

**localStorage keys** (`moodora.*`):

| Key | Written by | Contents |
|---|---|---|
| `moodora.session` | AuthPage (login/register/guest) | fake `{email, name}` |
| `moodora.name` | zustand `setName` / Profile | display name |
| `moodora.email`, `moodora.avatar` | Profile | email + base64 avatar preview |
| `moodora.projects` | zustand `setProjects` / `saveProject` | array of saved projects |
| `moodora.aesthetics` | zustand `setAesthetics` | the 15 moods + `favorited` flags |
| `moodora.theme`, `moodora.compact` | Settings | UI preferences |
| `moodora.feed.items`, `moodora.feed.name`, `moodora.feed.drafts` | Planner | draft feed state |
| `moodora.collage.layers`, `.bg`, `.format` | Collage | canvas state (auto-saved on change) |
| `moodora.openProject` | Dashboard/Projects "open" | one-shot hand-off to Planner/Collage on mount |

**IndexedDB**: database `moodora-local`, object store `photo-blobs` — original uploaded files.

**Hard-coded seed data** (no network calls): `App.tsx` lines 30–61 — 12 Pexels image URLs, 15
`seedAesthetics` entries (line 44) and the `categories` filter list (line 61). This is the imagery you
see everywhere in the app.

---

## 6. Dead weight — things that WILL confuse you

1. **`components/ui/*.tsx` is ~95% unused.** Only `toaster.tsx` and `tooltip.tsx` are imported by
   `App.tsx` (plus `error-boundary.tsx`). The other ~52 files are untouched shadcn scaffolding.
2. **`@workspace/api-client-react` is a declared dependency but never imported** by the app code.
3. **The API server, DB and OpenAPI spec are placeholders.** No feature uses them, no tables exist.
   `DATABASE_URL` is mentioned in `replit.md` but nothing needs it to run the frontend.
4. **Two "NotFound" components exist**: `App.tsx` line 596 (used) and `src/pages/not-found.tsx` (unused).
5. **`package-lock.json` sits next to `pnpm-lock.yaml`** — ignore it. The root `preinstall` script tries
   to delete lockfiles and rejects non-pnpm installs.
6. **`replit.md` is still the blank template** ("[Project name]", "_Populate as you build_"). Do not treat
   it as documentation of this app.
7. **`src/pages/` contains only that unused 404 page** — all real "pages" are functions inside `App.tsx`.
8. **Only two workspace packages can run**: `@workspace/moodora` (the product) and `@workspace/api-server`.
   `mockup-sandbox` also has a dev script but is a development tool, not the product.

---

## 7. Prove-you-understand-it exercises

1. Visit `http://localhost:20115/nonexistent`. Why do you get the app's custom "This page wandered off."
   instead of a server 404? (Answer: `artifact.toml` rewrites `/*` → `/index.html`, then wouter falls
   through to the catch-all `<Route component={NotFound}/>` on line 109.)
2. In `gridCells()` (line 303) change `layout==='Vertical columns'` to `'Vertical column'` and generate a
   collage grid. Watch the layout change — now you know exactly where grid math lives.
3. Add a 16th entry to `seedAesthetics` (line 44) and confirm it appears in `/explore`. Then click
   "Clear local projects" in Settings — why does your addition survive? (Hint: `seedAesthetics` is the
   fallback value and clearing removes the localStorage override that was shadowing it.)
4. Search the code for `read('` to list every persisted state key. That list *is* the app's "database schema".
5. Remove the `<QueryClientProvider client={queryClient}>` wrapper in `App()` (line 599). The app still
   works — proof that React Query is unused setup.
6. Rename the `moodora.` key prefix everywhere. What "breaks"? (Answer: nothing crashes, but every
   existing user's saved data appears to vanish — a good lesson in why key names are a public contract.)

---

## 8. Suggested order of learning (for a non-coder)

Because you're new to this, here is the shortest path from "no idea" to "I can read any file here":

1. **JSX + components** — read `App.tsx` lines 188–193 (`FeatureCard`). It's 5 lines.
2. **Props** — the same function receives `{title, text, image, href, tag}` from line 176. That's props.
3. **useState** — line 87 (`const [toast, setToast] = useState('')`) plus line 88 (`notify`).
4. **Lists + `map`** — line 238, mapping over `studio.aesthetics`.
5. **Events** — line 210 (`onClick` / `onSubmit` / `onChange`).
6. **Routing** — lines 93–111.
7. **Global state** — lines 67–83.
8. **Effects + refs** — lines 356–427 (the collage). Hardest; do it last.
9. **Styling** — `index.css` lines 59–120.

---

## 9. If you ever want to turn this into a real product

Gaps, in rough priority order:

1. **Real backend + auth.** `artifacts/api-server` exists but is empty; `lib/db/src/schema/index.ts`
   has no tables. That's the natural place to start.
2. **Move data server-side.** Replace `local-assets.ts` (IndexedDB) and the `moodora.*` keys with API
   calls backed by Postgres. (`lib/api-spec/openapi.yaml` + Orval codegen regenerate the typed clients
   for you.)
3. **Refactor `App.tsx`** (604 lines, everything in one file) into `pages/`, `components/`, `store/`,
   `lib/`. Biggest maintainability win, zero behaviour change.
4. **Delete dead weight**: `mockup-sandbox`, unused `components/ui/*`, `pages/not-found.tsx`,
   `scripts/hello.ts`, `package-lock.json`.
5. **Make the scripts cross-platform** (replace `export VAR=...` npm scripts) so `pnpm dev` works on
   Windows without manual env vars.
6. **Fill in `replit.md`** with what the app actually is, so future you isn't reading a blank template.




