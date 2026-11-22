# Moodora frontend

A small creative studio that runs in the browser: plan a feed, make collages, and save moods.

There is no backend yet. The database schema is empty and everything is saved in the browser (localStorage and IndexedDB). Passwords are never stored, so login accepts any valid email with a password of 6 or more characters.

## Run it

From the repository root:

```powershell
pnpm run dev
```

Then open http://localhost:5000. The port and base path come from `artifacts/moodora/.env.local` (`PORT` and `BASE_PATH`), which is not committed, so create it on a new machine.

## The look

Y2K, solid and minimal.

- Solid denim blue, sky, silver and lilac with black outlines. The colors are in [tokens.css](src/styles/tokens.css).
- Bodoni Moda (magazine-style serif) for titles and Figtree for everything else.
- Mac-style windows with a blue slab behind them, and a dock at the bottom for navigation.
- Chat bubbles, a calendar, sticker text, small doodles and a clickable Photo Booth on the landing page.
- Two themes: Daylight and Midnight.

## Where things are

Everything is in `src/`.

| Folder | What's in it |
|---|---|
| `App.tsx` | Providers and routes only |
| `pages/` | One folder per page |
| `components/` | Shared pieces such as the dock, windows and cards |
| `stores/` | App state: user, projects, moods, settings, toasts |
| `models/` | All data types |
| `data/` | Sample photos, moods and collage options |
| `lib/` | Helper functions: storage, exports, form validation, collage layouts |
| `hooks/` | Hooks used by the UI kit in `components/ui` |
| `styles/` | CSS: tokens, base, components, landing, pages |

## Pages

| Route | Page |
|---|---|
| `/` | [LandingPage](src/pages/landing/LandingPage.tsx) |
| `/login` | [LoginPage](src/pages/auth/LoginPage.tsx) |
| `/register` | [RegisterPage](src/pages/auth/RegisterPage.tsx) |
| `/dashboard` | [DashboardPage](src/pages/dashboard/DashboardPage.tsx) |
| `/planner` | [PlannerPage](src/pages/planner/PlannerPage.tsx) |
| `/collage` | [CollagePage](src/pages/collage/CollagePage.tsx) |
| `/explore` | [ExplorePage](src/pages/explore/ExplorePage.tsx) |
| `/projects` | [ProjectsPage](src/pages/projects/ProjectsPage.tsx) |
| `/profile` | [ProfilePage](src/pages/profile/ProfilePage.tsx) |
| `/settings` | [SettingsPage](src/pages/settings/SettingsPage.tsx) |
| anything else | [NotFoundPage](src/pages/NotFoundPage.tsx) |

## Models

A `?` means the property is optional.

### User

The person using this browser. Defined in [user.ts](src/models/user.ts).

| Property | Type | Notes |
|---|---|---|
| `name` | string | Display name |
| `email` | string | |
| `avatar` | string | Profile photo as a data URL, or `""` when none is set |

### Session

Marks someone as signed in. Defined in [user.ts](src/models/user.ts).

| Property | Type |
|---|---|
| `email` | string |
| `name` | string |

### LoginInput

The login form. Defined in [auth-schema.ts](src/lib/auth-schema.ts).

| Property | Type | Rule |
|---|---|---|
| `email` | string | Valid email |
| `password` | string | 6 or more characters, not stored |

### RegisterInput

The registration form. Defined in [auth-schema.ts](src/lib/auth-schema.ts).

| Property | Type | Rule |
|---|---|---|
| `name` | string | 2 or more characters |
| `email` | string | Valid email |
| `password` | string | 6 or more characters, not stored |

### Project

Anything saved to Projects. Defined in [project.ts](src/models/project.ts).

| Property | Type | Notes |
|---|---|---|
| `id` | string | |
| `title` | string | |
| `type` | `"feed"` or `"collage"` | |
| `createdAt` | string | ISO date |
| `updatedAt` | string | ISO date |
| `thumbnail` | string | Image URL |
| `content` | FeedContent or CollageContent | Depends on `type` |

### FeedContent

The `content` of a feed project. Defined in [feed.ts](src/models/feed.ts).

| Property | Type |
|---|---|
| `items` | PhotoAsset[] |

### CollageContent

The `content` of a collage project. Defined in [collage.ts](src/models/collage.ts).

| Property | Type | Notes |
|---|---|---|
| `layers` | Layer[] | |
| `bg` | string | Background color |
| `mode` | `"grid"` or `"creative"` | |
| `count` | number | Photos in the layout |
| `layout` | string | Grid style name |
| `canvasFormat` | `"Square"`, `"Portrait"` or `"Story"` | |

### Layer

One element on the collage canvas. Defined in [collage.ts](src/models/collage.ts).

| Property | Type | Notes |
|---|---|---|
| `id` | string | |
| `kind` | `"image"`, `"text"` or `"shape"` | |
| `x`, `y` | number | Position, in % of the canvas |
| `w`, `h` | number | Size, in % of the canvas |
| `text?` | string | Text layers only |
| `src?` | string | Image layers only |
| `shape?` | `"rect"` or `"circle"` | Shape layers only, `"rect"` by default |
| `color?` | string | |
| `rotation?` | number | Degrees |
| `opacity?` | number | 0 to 1 |

### PhotoAsset

A photo in the feed. Defined in [photo.ts](src/models/photo.ts).

| Property | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | |
| `url` | string | Data URL for uploads, remote URL for samples |
| `width` | number | |
| `height` | number | |

### FeedDraft

A saved version of a feed grid. Defined in [feed.ts](src/models/feed.ts).

| Property | Type |
|---|---|
| `id` | string |
| `name` | string |
| `items` | PhotoAsset[] |

### Aesthetic

A mood in the mood library. Defined in [aesthetic.ts](src/models/aesthetic.ts).

| Property | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | |
| `category` | string | |
| `description` | string | |
| `palette` | string[] | Hex colors |
| `images` | string[] | Image URLs |
| `favorited` | boolean | |

### Settings

Defined in [settings.ts](src/models/settings.ts).

| Property | Type | Notes |
|---|---|---|
| `theme` | `"light"` or `"dark"` | Daylight or Midnight |
| `compact` | boolean | Smaller cards on the Projects page |

## Bugs fixed in the redesign

- Login never submitted, because a hidden name field failed validation.
- Feed export was blocked by the sample photos.
- The Circle button added a square.
- Collage photos were stretched, and text shrank each time it was moved.
- Uploading several collage photos at once kept only the last one.
- The dark theme didn't load on startup, and the compact cards setting did nothing.

## Testing status

Typecheck and the production build pass. Checked in the browser: login, the register form's error messages, feed and collage dragging, undo and redo, saving, exporting, projects, moods, clear data, dark mode and phone width.

Not tested yet: photo uploads (including the multi-photo fix above) and a complete sign-up.
