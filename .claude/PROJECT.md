# Body Music Radio - Project Overview

## Project Summary
Body Music Radio is a Vue 3 web application for streaming an online radio station. It provides live audio streaming, track discovery, schedule browsing, and album showcasing, optimized for mobile devices and installable as a PWA.

## Core Features

### 🎵 Audio Streaming
- Live radio stream with Howler.js, in a sticky header player shown on every page
- Media Session API integration: lock-screen controls and track info, updated on every track change

### 📱 Mobile UI
- Single breakpoint at 720px: the desktop header nav is replaced by a popup menu (Accueil, Prog, Historique, Albums)
- Smooth page transitions
- Installable PWA

### 📻 Radio Information
- **Now Playing**: current track in the header player (polled every 15s)
- **Track History**: last 10 tracks played
- **Weekly Schedule**: from `public/schedule.json`, current show highlighted in Paris time
- **Featured Album**: home page section from an n8n webhook
- **Albums Collection**: liked albums grouped by month (sticky full-width month tabs), from an n8n webhook backed by a Google Sheet. Album reviews are paused until the backend handling is reworked.

## Tech Stack
- **Vue 3** (`<script setup>`), **Vue Router 4**, **Vite**
- **Howler.js** + Media Session API
- **Lucide** icons (`lucide-vue-next`, registered in `useIcons.js`), custom CSS
- **vite-plugin-pwa**
- **Vitest** for unit tests (`npm test`)

### Data Sources
- **Radio stream**: `https://azuracast.niprobin.com/listen/body_music_radio/public.mp3`
- **Now playing**: `/api/nowplaying`, a Vercel function proxying Icecast's `status-json.xsl`. AzuraCast's own nowplaying API is deliberately not used (Liquidsoap 2.4.5 replay_metadata bug freezes metadata).
- **History**: `/api/history`, a Vercel function proxying an n8n webhook (env var `N8N_HISTORY_WEBHOOK_URL`)
- **Featured album**: `https://n8n.niprobin.com/webhook/featured-album`
- **Albums**: `https://n8n.niprobin.com/webhook/liked-albums` (all fields are strings, dates are `DD-MM-YYYY`)
- **Analytics**: page views POSTed to `https://n8n.niprobin.com/webhook/analytics`

## Project Structure

```
api/                     # Vercel serverless functions
├── _fetchJson.js        # Shared fetch-with-timeout (underscore = not deployed as a function)
├── nowplaying.js
└── history.js
src/
├── main.js, App.vue
├── router/index.js
├── lib/                 # Pure logic, unit tested
│   ├── albums.js        # Album rules: external link, dates
│   ├── schedule.js      # Current show in Paris time
│   ├── playerLabel.js   # Header player text
│   └── poller.js        # Interval polling helper
├── composables/         # useNowPlaying, useHistory, useAnalytics, useIcons
├── components/          # HeaderPlayer, MobileNavigation, SiteFooter, StarRating, LucideIcon
└── pages/               # Home, Schedule, LastSongs, Albums
tests/                   # Vitest: lib modules + API handlers
```

## Deployment
- **Platform**: Vercel (`vercel.json` rewrites every non-`/api/` path to `index.html`)
- **Build**: `vite build` → `dist/`

## Change History
The entries below are historical and describe the code as it was at the time.

## Recent Changes (2024-02-13)

### Album Reviews Feature Implementation
- **Added new route**: `/albums/:slug` for individual album review pages
- **Enhanced Albums.vue**: Modified `getAlbumLink()` function to prioritize internal review links over external links
- **Created AlbumReview.vue**: Full-page component for displaying album reviews with responsive design
- **Visual indicators**: Added review badge (📝) on album covers for albums with reviews
- **Data structure support**: Now expects `has_review`, `slug`, and `text` fields from n8n webhook
- **Conditional routing**: Albums with reviews open in same tab, external links open in new tabs

### Technical Updates
- **Dependencies**: Added `vite-ssg` and `@vueuse/head` for future SSG support
- **Router**: Added lazy-loaded dynamic route for album reviews
- **Build**: Maintains SPA build for now (SSG available as future enhancement)
- **Styling**: Review pages use consistent design language with existing app

### File Changes
- `src/pages/Albums.vue`: Updated linking logic and template for conditional behavior
- `src/pages/AlbumReview.vue`: New component for individual review pages
- `src/router/index.js`: Added `/albums/:slug` route
- `package.json`: Added SSG dependencies and build scripts
- `vite.config.js`: Configured for potential SSG usage

## Recent Changes (2024-02-24)

### Added "Liked Date" Display to Album Reviews
- **Enhanced AlbumReview.vue**: Added display of "liked_date" showing when albums were listened to
- **New function**: Added `formatLikedDate()` function (lines 119-125) using same pattern as `formatReleaseDate()`
- **Template update**: Added conditional liked date display (lines 29-31) showing "écouté le [date]" in French
- **Edge case handling**: Uses `v-if="album.liked_date"` to only show when data exists, fallback for invalid dates
- **Styling**: Uses existing `.album-details` class for visual consistency with release date

### File Changes
- `src/pages/AlbumReview.vue`: Added liked_date function and template display

## Development Notes
- Uses ES modules and modern JavaScript
- Mobile-first development approach
- External API integrations for live data
- Clean component architecture with Vue 3 best practices
- Ready for future SSG implementation when needed
## Recent Changes (2026-03-09)

### Improved Star Ratings with FontAwesome Icons
- **Created StarRating.vue component**: New reusable component for displaying star ratings using FontAwesome icons
  - Props: `rating` (number 0-5) and `size` ('medium'|'large')
  - FontAwesome `faStar` icons instead of Unicode characters
  - Enhanced styling with transitions and better spacing
  - Medium size (1.1rem) and Large size (1.4rem) - bigger than previous implementation
- **Updated main.js**: Added `faStar` import and library registration for FontAwesome
- **Updated Albums.vue**: Replaced two star rating sections (lines 39-45 and 104-107) with StarRating component
  - Added StarRating import
  - Removed duplicated CSS for `.album-rating`, `.album-star`, `.album-star--filled`
  - Both locations use size="medium"
- **Updated AlbumReview.vue**: Replaced star rating section (lines 32-39) with StarRating component
  - Added StarRating import
  - Removed CSS for `.album-star` and `.album-star--filled`
  - Uses size="large" for bigger stars
  - Kept `.rating-text` CSS for "X/5" text display

### Benefits
- **Prettier icons**: Professional FontAwesome stars instead of Unicode characters
- **Bigger sizes**: Increased from 0.95rem/1.2rem to 1.1rem/1.4rem respectively
- **Eliminated duplication**: Single reusable component instead of copy-pasted code
- **Enhanced styling**: Better visual appearance with transitions
- **Maintainable**: All star rating logic centralized in one component

### File Changes
- `src/main.js`: Added faStar import and registration
- `src/components/StarRating.vue`: New reusable component (new file)
- `src/pages/Albums.vue`: Replaced star rating sections, removed CSS, added import
- `src/pages/AlbumReview.vue`: Replaced star rating section, removed CSS, added import

## Recent Changes (2026-03-25)

### Now-Playing Integration in Audio Player
- **Created useNowPlaying composable**: New shared state management for now-playing API data
  - Single polling instance with reference counting prevents duplicate API calls
  - 10-second polling interval consistent with existing LastSongs implementation
  - Automatic cleanup when components unmount
  - Error handling with graceful fallbacks
  - API: `https://azuracast.niprobin.com/api/nowplaying/body_music_radio?cb=[timestamp]`

- **Enhanced RadioPlayer component**: Dynamic track information display
  - Replaced static "Body Music Radio" with current track title
  - Shows artist name as subtitle when track data is available
  - Falls back to "Vous écoutez Body Music Radio" when no track data or not playing
  - Enhanced MediaSession integration with real track metadata and album art
  - Maintains responsive behavior (hidden on mobile <720px)

- **Refactored LastSongs component**: Uses shared composable instead of direct API calls
  - Removed duplicate API fetching and polling logic
  - Uses shared state from useNowPlaying composable
  - Maintains existing UI with no visual changes
  - Improved performance by eliminating duplicate network requests

### Display Format
- **When track data available**: Title as headline, Artist as subtitle
- **When no track data**: "Body Music Radio" headline, "Vous écoutez Body Music Radio" subtitle
- **During connection states**: Shows appropriate status messages (loading, error, etc.)

### Technical Benefits
- **Efficient resource usage**: Single API call every 10 seconds regardless of active components
- **Follows project patterns**: Uses composable pattern consistent with existing useAnalytics.js
- **Enhanced media controls**: Rich MediaSession integration with current track info and album art
- **Graceful degradation**: Radio player works normally even if now-playing API fails

### File Changes
- `src/composables/useNowPlaying.js`: New shared composable for API state management (new file)
- `src/components/RadioPlayer.vue`: Added dynamic track display and enhanced MediaSession
- `src/pages/LastSongs.vue`: Refactored to use shared composable, removed direct API calls

## Recent Changes (2026-03-25) - Mobile UI Rework

### Mobile Audio Player UI Redesign
- **Created MobileNavigation component**: New bottom navigation bar for mobile devices
  - Fixed positioning at screen bottom with proper z-index layering
  - Three navigation items (Accueil, Prog, Historique) with FontAwesome icons
  - Touch-optimized 44px minimum touch targets
  - Active state indication for current page
  - Safe area support for devices with home indicators
  - Hidden on desktop (>720px), visible only on mobile (≤720px)

- **Restructured RadioPlayer for mobile**: Major mobile layout improvements
  - **Removed action menu**: Eliminated navigation buttons from player (previously taking 80% width)
  - **Repositioned player**: Moved from `bottom: 16px` to `bottom: 80px` to accommodate bottom navigation
  - **Show track info on mobile**: Removed `display: none` rule for `.player-title` and `.player-status`
  - **Optimized mobile layout**: New structure `[Play Button 56px] [Track Info - flexible] [Hidden Volume]`
  - **Enhanced typography**: Added text truncation, responsive font sizes, proper ellipsis handling
  - **Maintained desktop experience**: No changes to desktop layout (>720px)

- **App integration**: Updated root application structure
  - Added MobileNavigation component to App.vue template
  - Proper component ordering: Header → Main → RadioPlayer → MobileNavigation → Footer
  - Conditional rendering ensures mobile-only visibility

- **Responsive enhancements**: Global mobile layout improvements
  - Added mobile-specific padding (240px) to main content area
  - Prevents content from being hidden behind bottom navigation and player
  - Safe area handling for modern mobile devices
  - Smooth transitions between desktop and mobile breakpoints

### Mobile UX Improvements
- **Before**: Track info hidden, navigation taking 80% of player space, poor mobile experience
- **After**: Full track visibility with "Artist - Song" display, dedicated bottom navigation bar, app-like mobile experience

### Design Benefits
- **Industry Standard**: Follows iOS/Android bottom navigation patterns
- **Thumb Accessibility**: Navigation at bottom edge for easy one-handed use
- **Space Efficiency**: Player space dedicated to music information display
- **Visual Hierarchy**: Clear separation between navigation and player functionality
- **Future-Scalable**: Easy to add more navigation items or features

### File Changes
- `src/components/MobileNavigation.vue`: New bottom navigation component (new file)
- `src/components/RadioPlayer.vue`: Removed mobile action menu, repositioned player, enabled track display
- `src/App.vue`: Added MobileNavigation component integration
- `src/style.css`: Added mobile-specific padding and safe area support

## Recent Changes (2026-10-21) - Review fixes (issue #1)
- Review links use `router-link`, so opening a review no longer reloads the page and cuts the stream
- Review page only opens albums with `has_review === "TRUE"`; review text rendered as text (no `v-html`)
- Albums cache survives corrupt/blocked storage and refreshes its timestamp on every fetch
- Lock-screen metadata follows the current track; player shows the title alone when the artist is unknown
- Schedule computed in Paris time, `23:59` treated as midnight
- Home hero renders immediately; Albums added to the mobile menu; analytics only drops same-path duplicates
- Shared logic moved to `src/lib/`, Vitest added, Netlify config and unused deps/SSG leftovers removed, `vercel.json` added

## Recent Changes (2026-10-21) - Album reviews removed from the frontend
- Removed the "Nos coups de cœurs" section, the `/albums/:slug` review page and the review-only album rules: reviews are on hold until the backend handling is reworked (see `ALBUM_REVIEWS_IMPLEMENTATION_PLAN.md` and git history to restore)
- Albums page shows every album grouped by liked month; the month tab bar is full width and sticks under the header player
