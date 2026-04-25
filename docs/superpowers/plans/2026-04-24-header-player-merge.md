# HeaderPlayer Component Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge Header.vue and RadioPlayer.vue into a unified HeaderPlayer.vue component with single cohesive blur background

**Architecture:** Create new HeaderPlayer.vue combining all functionality from both components into a 19vh sticky header with unified backdrop-filter blur effect and two-section layout (navigation + audio controls)

**Tech Stack:** Vue 3, Vue Router, Howler.js, useNowPlaying composable, LucideIcon, MobileNavigation

---

## File Structure

**Create:**
- `src/components/HeaderPlayer.vue` - Unified header+player component

**Modify:**
- `src/App.vue` - Update imports to use new HeaderPlayer

**Remove:**
- `src/components/Header.vue` - Original header component
- `src/components/RadioPlayer.vue` - Original radio player component

## Tasks

### Task 1: Create HeaderPlayer Component Structure

**Files:**
- Create: `src/components/HeaderPlayer.vue`

- [ ] **Step 1: Create base component file with template structure**

```vue
<template>
  <div :class="['header-player', { 'header-player--scrolled': scrolled }]">
    <!-- Header Section (10vh) -->
    <header class="header-section">
      <div class="header-inner">
        <router-link to="/" class="header-logo">
          <img src="/body-music-gradient.png" alt="Body Music Radio" />
        </router-link>
        <nav class="header-nav">
          <router-link to="/">Accueil</router-link>
          <router-link to="/schedule">Programmation</router-link>
          <router-link to="/last-songs">Dernières tracks</router-link>
          <router-link to="/albums">Nos albums</router-link>
        </nav>
      </div>
    </header>
    
    <!-- Player Section (9vh) -->
    <div class="player-section">
      <div class="player-stack">
        <div class="player-primary">
          <button class="player-btn" @click="togglePlay" :disabled="isLoading">
            <span class="icon-wrapper">
              <LucideIcon :icon="isPlaying ? 'pause' : 'play'" />
            </span>
          </button>
          <div class="player-meta">
            <p class="player-title">{{ displayTitle }}</p>
          </div>
        </div>
        
        <!-- Mobile More Button -->
        <button class="mobile-more-btn" @click="toggleMobileNav">
          <LucideIcon icon="ellipsis" />
        </button>
      </div>

      <!-- Mobile Navigation Popup -->
      <MobileNavigation v-if="showMobileNav" @close="showMobileNav = false" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify template structure**

Visual check: Component has two main sections (header and player) with proper nesting

### Task 2: Merge Script Setup Functionality

**Files:**
- Modify: `src/components/HeaderPlayer.vue`

- [ ] **Step 3: Add script setup with merged imports and state**

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useNowPlaying } from '../composables/useNowPlaying.js'
import MobileNavigation from './MobileNavigation.vue'
import LucideIcon from './LucideIcon.vue'

// Header state - scroll detection
const scrolled = ref(false)

// RadioPlayer state - audio functionality
const streamUrl = 'https://azuracast.niprobin.com/listen/body_music_radio/public.mp3'
const isPlaying = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const volume = ref(1.0)
const isMuted = ref(false)
const showMobileNav = ref(false)
let howl

// Now-playing integration
const { nowPlaying, getTrackTitle, getTrackArtist, getTrackArt } = useNowPlaying()

// Display logic for track information (from RadioPlayer)
const displayTitle = computed(() => {
  if (isError.value) return 'Erreur, réessayez'
  if (isLoading.value) return 'Connexion au stream...'
  if (!isPlaying.value) return 'Lancer la radio'

  const artist = getTrackArtist()
  const title = getTrackTitle()

  if (artist && title) {
    return `${title}  •  ${artist}`
  }

  return 'Body Music Radio'
})

// Scroll detection function (from Header)
function onScroll() {
  scrolled.value = window.scrollY > 0.10
}

// Audio functions (from RadioPlayer)
function initHowler() {
  isLoading.value = true
  isError.value = false
  howl = new Howl({
    src: [streamUrl],
    html5: true,
    volume: isMuted.value ? 0 : volume.value,
    format: ['mp3'],
    onplay: () => {
      isPlaying.value = true
      isLoading.value = false
      if ('mediaSession' in navigator) {
        const trackTitle = getTrackTitle()
        const trackArtist = getTrackArtist()
        const trackArt = getTrackArt()

        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: trackTitle || 'Body Music Radio',
          artist: trackArtist || 'Live',
          album: trackTitle ? 'Body Music Radio' : 'Body Music',
          artwork: [
            {
              src: trackTitle ? trackArt : '/browser_icon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        })

        navigator.mediaSession.setActionHandler('play', () => {
          if (!isPlaying.value) {
            if (howl) {
              howl.unload()
              howl = null
            }
            initHowler()
            howl.play()
          }
        })

        navigator.mediaSession.setActionHandler('pause', () => {
          if (isPlaying.value && howl) {
            howl.unload()
            howl = null
            isPlaying.value = false
            isLoading.value = false
            navigator.mediaSession.metadata = null
          }
        })
      }
    },
    onend: () => {
      isPlaying.value = false
    },
    onloaderror: () => handleStreamError(),
    onplayerror: () => handleStreamError()
  })
}

function handleStreamError() {
  isError.value = true
  isLoading.value = false
  isPlaying.value = false
}

function togglePlay() {
  if (isLoading.value) return
  if (!isPlaying.value) {
    if (howl) {
      howl.unload()
      howl = null
    }
    initHowler()
    howl.play()
  } else if (howl) {
    howl.unload()
    howl = null
    isPlaying.value = false
  }
}

function toggleMobileNav() {
  showMobileNav.value = !showMobileNav.value
}

// Lifecycle hooks - merged from both components
onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (howl) {
    howl.unload()
    howl = null
  }
})
</script>
```

- [ ] **Step 4: Verify script functionality**

Check: All imports resolve, no syntax errors in script setup section

### Task 3: Add Unified CSS Styling

**Files:**
- Modify: `src/components/HeaderPlayer.vue`

- [ ] **Step 5: Add comprehensive CSS with unified blur background**

```vue
<style scoped>
/* Main container with unified blur background */
.header-player {
  position: sticky;
  top: 0;
  width: 100%;
  height: 19vh; /* Combined height of both components */
  z-index: 998;
  display: flex;
  flex-direction: column;
  
  /* Unified blur background */
  background-color: rgba(244, 241, 241, 0.05);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(70, 69, 69, 0.95);
}

/* Header Section Styles (from Header.vue) */
.header-section {
  height: 10vh;
  display: flex;
  align-items: center;
}

.header-inner {
  width: 100%;
  height: 100%;
  max-width: 95vw;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.header-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 180px;
}

.header-logo img {
  width: 100%;
  object-fit: contain;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.header-nav a {
  color: #f8fafc;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding: 6px 10px;
  border-radius: 4px;
}

.header-nav a.router-link-active {
  background-color: #f3efe8;
  color: #111;
}

/* Player Section Styles (from RadioPlayer.vue) */
.player-section {
  height: 9vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(70, 69, 69, 0.95);
}

.player-stack {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  height: 9vh;
  width: 95vw;
}

.player-primary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  flex: 1;
}

.player-btn {
  height: 6vh;
  aspect-ratio: 1 / 1;
  background: #f3efe8;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 100%;
  border: transparent;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper > svg {
  width: 16px;
  stroke: 1px;
  fill: #111;
}

.player-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem 1.5rem;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.player-title {
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f8fafc;
}

/* Mobile Styles */
@media (max-width: 720px) {
  .header-inner {
    flex-direction: column;
    justify-content: center;
  }

  .header-nav {
    display: none;
  }

  .player-stack {
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: 0;
    height: 11vh;
  }

  .player-btn {
    font-size: 1.1rem;
  }

  .player-meta {
    flex: 1;
    min-width: 0;
    max-width: calc(100% - 112px);
    gap: 0.1rem;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  }

  .player-title {
    font-size: 0.9rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .mobile-more-btn {
    width: 48px;
    height: 6vh;
    border: none;
    background: transparent;
    color: #f8fafc;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .mobile-more-btn:active {
    transform: scale(0.95);
  }
}

/* Hide mobile more button on desktop */
@media (min-width: 721px) {
  .mobile-more-btn {
    display: none;
  }
}
</style>
```

- [ ] **Step 6: Verify CSS styling**

Visual check: Component has unified blur background, proper section heights, responsive behavior

### Task 4: Update App.vue Integration

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 7: Update App.vue imports and template**

Replace existing Header and RadioPlayer imports:

```vue
<template>
  <div id="app">
    <HeaderPlayer />
    <main class="main-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import HeaderPlayer from './components/HeaderPlayer.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>
```

- [ ] **Step 8: Verify App.vue integration**

Check: App.vue compiles without errors, HeaderPlayer component loads

### Task 5: Test Core Functionality

**Files:**
- Test: Application in browser

- [ ] **Step 9: Test desktop layout and navigation**

Actions:
1. Load application in browser (>720px width)
2. Verify header shows logo + navigation links
3. Verify player section shows play button + track info
4. Test navigation links work and show active states
5. Verify unified blur background spans full 19vh height

Expected: All functionality works identical to separate components

- [ ] **Step 10: Test audio functionality**

Actions:
1. Click play button
2. Verify audio stream starts playing
3. Verify track info updates with now-playing data
4. Verify MediaSession integration (lock screen controls)
5. Click pause, verify stream stops

Expected: Audio works identically to original RadioPlayer

- [ ] **Step 11: Test mobile responsiveness**

Actions:
1. Resize browser to <720px width
2. Verify navigation menu hidden, only logo shows
3. Verify player section shows play + track info + mobile more button
4. Click mobile more button, verify MobileNavigation popup opens
5. Test navigation within popup

Expected: Mobile behavior matches original implementation

### Task 6: Remove Original Components and Final Commit

**Files:**
- Remove: `src/components/Header.vue`
- Remove: `src/components/RadioPlayer.vue`

- [ ] **Step 12: Remove original components and commit changes**

```bash
git rm src/components/Header.vue src/components/RadioPlayer.vue
git add -A
git commit -m "feat: merge Header and RadioPlayer into unified HeaderPlayer component

- Create HeaderPlayer.vue combining Header + RadioPlayer functionality
- Unified 19vh sticky header with single backdrop-filter blur
- Maintains all existing functionality and responsive behavior  
- Remove original Header.vue and RadioPlayer.vue components
- Update App.vue to use new HeaderPlayer component

Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>"
```

- [ ] **Step 13: Final verification**

Actions:
1. Test all navigation links and routing
2. Test audio play/pause functionality  
3. Test mobile navigation popup
4. Verify unified blur background appearance
5. Check responsive layout breakpoints

Expected: All functionality identical to original with improved visual cohesion

## Success Criteria

✅ **Visual Unity**: Single cohesive blur background spans full 19vh header  
✅ **Functional Preservation**: All navigation, audio, and mobile features work identically  
✅ **Responsive Behavior**: Desktop and mobile layouts match original behavior  
✅ **Performance**: No regression in audio streaming or UI responsiveness  
✅ **Code Quality**: Clean, maintainable component architecture