# Mobile navigation: bottom tab bar (handoff spec)

Status: validated by Rob on 2026-11-16 (option "V2"). Ready to implement.
Mockups: Design canvas "BMR · Refonte /albums", artboards **Menu mobile — état actuel** (as-is) and **Menu V2 — Barre d'onglets en bas** (target, clickable)
(https://claude.ai/code/artifact/27dc1588-2655-476c-82d5-573e7586a077). V1 (dropdown) and V3 (bottom sheet) were rejected.

Scope: **mobile only (≤ 720px)**. The desktop header nav does not change.

## Why

The current "•••" menu (`MobileNavigation.vue`) has these problems:

1. **It covers the player bar.** The popup is `position: fixed; top: 9vh`, but `.header-player` has `backdrop-filter`, which makes it the containing block. The menu therefore lands exactly on the player row and hides the Play button and the "•••" button itself.
2. **It can't be dismissed without navigating.** `.nav-overlay` has no styles (0×0), and the toggle button is hidden under the popup.
3. **"•••" means "more actions", not "navigation"**, and hiding only 4 destinations behind it costs a tap every time. It also hurts discovery of Prog and Historique.
4. **Labels are 10.5px**, and the 4 targets have no gap between them.

## Target

A persistent tab bar fixed to the bottom of the screen on mobile, always showing the 4 destinations.

### Tab bar

- `position: fixed; left: 0; right: 0; bottom: 0; z-index: 990`. It sits below the header player (998) and the album sheet (1000).
- Height: 64px + `env(safe-area-inset-bottom)`. Padding: `6px 8px calc(6px + env(safe-area-inset-bottom))`.
- Background: `#111` (opaque, the colour the old mobile menu already used, so no new token). Top border: `1px solid hsla(0,0%,100%,0.1)`, the same hairline as the header player.
- 4 equal items (`flex: 1`), each a `router-link`, min height 56px, column layout, gap 4px:
  - **Icon "pill"**: 56×30px, `border-radius: 999px`, Lucide icon 22px. Icons stay as today: `house`, `calendar`, `music`, `disc`.
  - **Label**: 12px, line-height 1.
- Labels: **Accueil · Prog · Historique · Albums**. They stay short because of the width; the desktop nav keeps its long labels.
- States:
  - **Inactive**: color `#94a3b8`, weight 500, transparent pill.
  - **Active** (`router-link-active`; use exact matching for `/` so Accueil isn't always active): color `#f3efe8`, weight 600, pill background `rgba(243,239,232,0.16)`. Meaning is never carried by color alone: weight and pill change too.
  - **Pressed**: overlay `rgba(255,255,255,0.06)` on the pill (e.g. `box-shadow: inset 0 0 0 40px …`), no new palette colour. **Keyboard focus**: `:focus-visible` only, 2px `#f3efe8` outline on the pill (offset 2px); remove the link's own outline and the iOS tap highlight.
  - **Motion**: pill background and label colour transition in 200ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Nothing else moves. Respect `prefers-reduced-motion` (drop the transition).
- A11y: `<nav aria-label="Navigation principale">`. `router-link` already sets `aria-current="page"` on exact-active links; make sure `/` behaves.
- Hidden on desktop (`@media (min-width: 721px) { display: none }`).

### Header player (mobile)

- Keep the header player's look as it is today (translucent `rgba(244,241,241,0.05)` + `backdrop-filter: blur(12px)`). Only its contents change.
- Remove the "•••" button (`.mobile-more-btn`), `showMobileNav` and `toggleMobileNav`. The player row becomes: Play button + title, full width.
- Mockup tweaks shown in V2, to apply while we're here:
  - Play button 48×48px (today ~42px, it's `5vh`)
  - Title 15px / 600 (today 12.6px)

### Removals

- Delete `src/components/MobileNavigation.vue` and its import and usage in `HeaderPlayer.vue`.

### Layout side-effects (don't forget)

- **`index.html`**: change the viewport meta to `width=device-width, initial-scale=1.0, viewport-fit=cover`. Without it, `env(safe-area-inset-bottom)` is always 0 on iOS and the bar sits under the home indicator.
- **Page bottom padding on mobile**: the bar must not hide the footer or the last content. Add `padding-bottom: calc(64px + env(safe-area-inset-bottom))` to `.app-shell` (or `body`) under 720px.
- **`AlbumSheet.vue`** (z-index 1000) must open **over** the tab bar. Check this on /albums at 390px.
- `SiteFooter.vue` repeats the 4 links. That's fine to keep for now; flag it to Rob as possible cleanup.

## Implementation order (one step = one commit; check in with Rob between steps)

1. `MobileTabBar.vue` + mount it in `App.vue`, plus the viewport meta and bottom padding. Don't remove anything yet.
2. Remove the "•••" button and `MobileNavigation.vue`. Apply the Play button and title sizes.
3. Check at 390×844 on `/`, `/schedule`, `/last-songs` and `/albums`: active state, footer not hidden, album sheet over the bar, keyboard focus visible. Run `npm test` and `npm run build`.
4. Update `.claude/PROJECT.md`. The "Mobile UI" section still describes the popup menu.

## Tokens

Text `#f3efe8`, muted `#94a3b8` (7.6:1 on `#111`), bar surface `#111`, border `hsla(0,0%,100%,0.1)`, font Inter, icons Lucide via `LucideIcon.vue`.
