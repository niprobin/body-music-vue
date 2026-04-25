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

<style scoped>
/* Main container with unified blur background */
.header-player {
  position: sticky;
  top: 1vh;
  width: 99%;
  margin:0 auto;
  height: 18vh; /* Combined height of both components */
  z-index: 998;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: inset 0 0 0.5px 1px hsla(0, 0%, 100%, 0.1),
              /* 2. shadow ring 👇 */
              0 0 0 1px hsla(230, 13%, 9%, 0.075),
              /* 3. multiple soft shadows 👇 */
              0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
              0 0.9px 1.5px hsla(230, 13%, 9%, 0.045),
              0 3.5px 6px hsla(230, 13%, 9%, 0.09);

  /* Unified blur background */
  background-color: rgba(244, 241, 241, 0.05);
  backdrop-filter: blur(12px);
  /* border-bottom: 1px solid rgba(70, 69, 69, 0.95); */
}

/* Header Section Styles (from Header.vue) */
.header-section {
  height: 9vh;
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
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
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
  height: 5vh;
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
  width: 14px;
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
    width:95%;
    gap: 0;
  }

  .player-primary {
    justify-content: flex-start;
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
