# Body Music Radio - Project Overview

## Project Summary
Body Music Radio is a Vue 3 web application for streaming an online radio station. It provides live audio streaming, track discovery, schedule browsing, and album showcasing, optimized for mobile devices and deployable as a PWA.

## Core Features

### 🎵 Audio Streaming
- Live radio stream with Howler.js audio player
- Media Session API integration (lock screen controls)
- Persistent bottom player with play/pause controls

### 📱 Mobile-First UI
- Responsive design optimized for mobile devices
- Sticky header with scroll detection
- Smooth page transitions
- Installable PWA with offline capabilities

### 📻 Radio Information
- **Now Playing**: Real-time current track display
- **Track History**: Recently played songs
- **Weekly Schedule**: Programming schedule from JSON
- **Featured Album**: Highlighted album section via n8n webhook
- **Albums Collection**: Browse albums via Google Sheets integration

## Tech Stack

### Frontend Framework
- **Vue 3** (Composition API with `<script setup>`)
- **Vue Router 4** (SPA routing)
- **Vite** (build tooling and dev server)

### Audio & Media
- **Howler.js** (audio playback and controls)
- Media Session API (lock screen integration)

### UI & Styling
- **Font Awesome** icons
- Custom CSS with Bantayog font
- Mobile-first responsive design

### PWA & Performance
- **vite-plugin-pwa** (installability and offline support)
- Optimized for mobile performance

### External Data Sources
- **Radio Stream**: `https://radio.niprobin.com/listen/body_music_radio/body-radio-256`
- **Now Playing API**: `https://radio.niprobin.com/api/nowplaying/1`
- **Featured Album**: n8n webhook endpoint
- **Albums Data**: Google Sheets via OpenSheet API

## Project Structure

```
src/
├── main.js              # App initialization
├── App.vue              # Root layout component
├── router/index.js      # Vue Router configuration
├── components/          # Reusable components
│   ├── Header.vue       # Navigation header
│   ├── RadioPlayer.vue  # Audio player
│   └── SiteFooter.vue   # Footer
├── pages/               # Route components
│   ├── Home.vue         # Landing page
│   ├── Schedule.vue     # Weekly schedule
│   ├── LastSongs.vue    # Track history
│   ├── Albums.vue       # Album collection
│   └── AlbumReview.vue  # Individual album review
└── assets/              # Static assets (fonts, logos)
```

## Deployment
- **Platform**: Netlify
- **Build**: Static SPA with redirect rules
- **Environment**: Production-ready PWA

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
