# /albums redesign — "cover wall" (handoff spec)

Status: design validated by Rob on 2026-11-12. Ready to implement.
Mockups: Design canvas "BMR · Refonte /albums", artboards **C · Ordi** and **C · Mobile (cliquable)**
(https://claude.ai/code/artifact/27dc1588-2655-476c-82d5-573e7586a077). Pistes A and B on the same canvas were rejected.

## Why

The current page has three problems:

1. **Month tabs** show one month at a time. There is no overview, and finding an older album means clicking tab after tab.
2. **Mobile is 1 column**: huge covers and a very long scroll.
3. **Cards are noisy**: 5 yellow stars under every card, and no artist line.

## Target

One continuous wall of covers, grouped by month, with a rating filter.

### Layout

| | Desktop (> 720px) | Mobile (≤ 720px, the project's single breakpoint) |
|---|---|---|
| Grid | 6 columns, 8px gap | **2 columns**, 6px gap |
| Months | Full-width divider row inside the grid: month label (Gochi Hand, uppercase, ~26px) + 1px line filling the rest (`rgba(148,163,184,0.25)`) | Same, ~22px |
| Text on tile | Hidden; shown **on hover** (and on keyboard focus) as an overlay | **Always visible**, bottom-left of the cover |
| Click / tap | Opens the external link (Discogs/Spotify via `externalLink()`), as today | Opens a **bottom sheet** (see below) |
| Month jump | "Aller à" `<select>` listing the months, right side of the filter row; scrolls to that month's divider | Not needed (no select on mobile) |

- Page header unchanged: `h1` "Les albums en rotation" + the intro paragraph.
- Remove the sticky month tabs entirely (`.albums-tabs*` CSS and the `activeTab` logic).
- Months sorted newest first. Inside a month keep the current order (rating desc), unless it looks odd with real data; then ask Rob.
- Tiles: square, `border-radius: 4px`, `object-fit: cover`, no border/shadow needed.
- **No rating badge on tiles.** Rob tried a yellow badge and rejected it.

### Tile text overlay

- Container: absolute, bottom 0, full width, padding `22px 7px 6px` (mobile) / `12px` (desktop hover).
- Background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 100%)`. It must keep white text readable on light covers (WCAG 4.5:1).
- Line 1: album title, Inter 600, 14px mobile, `#fff`.
- Line 2: artist, Inter 400, 12px mobile, `#e2e8f0`.
- Both lines: single line, `text-overflow: ellipsis`.
- Desktop hover overlay also shows the rating line above the title: star icon + "4/5" in `#facc15`, 12px, 600.

### Filter

Segmented control (pill group, `role="group" aria-label="Filtrer par note"`), two buttons with `aria-pressed`:

- **Tous** (default)
- **★ Coups de cœur**: albums with `Number(rating) >= 4`. The star icon is yellow `#facc15`.

Active button: background `#f3efe8`, text `#111`, weight 600. Inactive: transparent, `#f3efe8`. Min height 40px.
Hide a month divider when the filter leaves that month empty. Full width on mobile (buttons `flex: 1`).

### Mobile bottom sheet

- Opens when a tile is tapped. It slides up from the bottom: `transform: translateY(110%)` → `translateY(0)`, `transition: transform .35s cubic-bezier(.32,.72,0,1)`.
- Backdrop `rgba(0,0,0,.5)` fades in (opacity .3s). Tapping it closes the sheet.
- Sheet: background `#1b2c3d`, `border-radius: 20px 20px 0 0`, top border `rgba(148,163,184,.25)`, grab handle (40×4px pill), padding `12px 20px 32px` + `env(safe-area-inset-bottom)`.
- Content: 96px cover · title (18px, 600) · artist (14px, `#cbd5e1`) · star + "N/5" (yellow) · "Sortie le {formatSheetDate(release_date)}" (12px, `#94a3b8`).
- Actions: primary pill "Voir sur Discogs" or "Écouter sur Spotify", depending on which link `externalLink()` returns. Hide it if there is no link. Secondary pill "Fermer".
- A11y: `role="dialog"`, `aria-modal="true"`, focus moves into the sheet, Escape closes, focus returns to the tile, body scroll locked while open.
- The sheet must sit above the sticky header player (check `z-index`).
- Use `<Teleport to="body">` if the page's stacking context gets in the way.

## Data

- Source unchanged: `fetchLikedAlbums()` / `readCachedAlbums()` in `src/lib/albums.js`. All fields are strings; dates are `DD-MM-YYYY`.
- **Artist / album:** the webhook sends Supabase `artist_name` and `album_name`; the front reads them via `albumNames(album)`. `release_name` is gone.
- Put grouping and filtering in `src/lib/albums.js` as pure functions with Vitest tests, like the existing helpers. For example:
  - `groupByMonth(list)` → `[{ key, label, items }]`, newest first (move the logic out of `Albums.vue`)
  - `isCoupDeCoeur(album)` → `Number(album.rating) >= 4`

## Important: don't break Home

Update 2026-11-12: Home ("Nos albums du moment") now uses `AlbumTile` + `AlbumSheet` too; `AlbumCard` and `StarRating` were removed.

## Implementation order (one step = one commit, check in with Rob between steps)

1. Confirm the artist field key. Add `groupByMonth` and `isCoupDeCoeur` to `lib/albums.js`, with tests.
2. `AlbumTile.vue`: cover + overlay. Mobile: always visible. Desktop: on hover/focus.
3. `Albums.vue`: remove the tabs. Render the wall: grid with month dividers, 6 cols desktop / 2 cols mobile.
4. Filter "Tous / Coups de cœur".
5. Mobile bottom sheet (`AlbumSheet.vue`): animation, a11y, z-index vs header player.
6. Desktop "Aller à" month select (scroll to divider, offset for the sticky header player).
7. `npm test` + `npm run build`. Visual check at 390px and 1280px. Update `.claude/PROJECT.md` (the "Albums Collection" line still mentions month tabs).

## Design tokens (existing, from `src/style.css`)

- Background: `linear-gradient(to bottom, #000, #152331, #152331)` (body, unchanged)
- Text `#f3efe8`, muted `#94a3b8`, secondary `#cbd5e1`, star yellow `#facc15`
- Fonts: Gochi Hand (titles, uppercase), Inter (body)
- Icons: Lucide via `LucideIcon.vue`. `star` is already registered.

Update 2026-11-12: on desktop a tile click also opens `AlbumSheet`, as a drawer sliding in from the right (400px); the external link is only in the sheet.
