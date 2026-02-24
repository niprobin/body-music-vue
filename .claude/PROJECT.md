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