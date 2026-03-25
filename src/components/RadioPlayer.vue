<template>
  <div class="radio-player-bar section-card">
    <div class="player-stack">
      <div class="player-primary">
        <button class="player-btn" @click="togglePlay" :disabled="isLoading">
          <span class="btn-glow" />
          <span class="icon-wrapper">
            <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
          </span>
        </button>
        <div class="player-meta">
          <p class="player-title">{{ displayTitle }}</p>
          <p v-if="shouldShowSubtitle" class="player-status">{{ displaySubtitle }}</p>
        </div>
      </div>
      <div class="player-controls">
        <button class="volume-btn" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
          <font-awesome-icon :icon="isMuted ? 'volume-xmark' : 'volume-high'" />
        </button>
      </div>
      <!-- Mobile More Button -->
      <button class="mobile-more-btn" @click="toggleMobileNav">
        <font-awesome-icon icon="ellipsis" />
      </button>
    </div>

    <!-- Mobile Navigation Popup -->
    <MobileNavigation v-if="showMobileNav" @close="showMobileNav = false" />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useNowPlaying } from '../composables/useNowPlaying.js'
import MobileNavigation from './MobileNavigation.vue'

const streamUrl = 'https://azuracast.niprobin.com/listen/body_music_radio/public.mp3'
const isPlaying = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const volume = ref(1.0) // 100% by default
const isMuted = ref(false)
const showMobileNav = ref(false)
let howl

// Now-playing integration
const { nowPlaying, getTrackTitle, getTrackArtist, getTrackArt } = useNowPlaying()

// Display logic for track information
const displayTitle = computed(() => {
  // If there's an error or loading state, show status
  if (isError.value) return 'Erreur, réessayez'
  if (isLoading.value) return 'Connexion au stream...'

  // If not playing, show launch message
  if (!isPlaying.value) return 'Lancer la radio'

  // When playing, show track info or station name
  const artist = getTrackArtist()
  const title = getTrackTitle()

  if (artist && title) {
    return `${title} — ${artist}`
  }

  return 'Body Music Radio'
})

const displaySubtitle = computed(() => {
  return 'Vous écoutez Body Music Radio'
})

const shouldShowSubtitle = computed(() => {
  // Only show subtitle when playing (not during error, loading, or paused states)
  return isPlaying.value && !isError.value && !isLoading.value
})

const statusText = computed(() => {
  if (isError.value) return 'Erreur, réessayez'
  if (isLoading.value) return 'Connexion au stream...'
  if (isPlaying.value) return 'Bonne écoute !'
  return 'Lancer la radio'
})

function initHowler() {
  isLoading.value = true
  isError.value = false
  howl = new Howl({
    src: [streamUrl],
    html5: true,
    volume: isMuted.value ? 0 : volume.value, // Respect mute state on initialization
    format: ['mp3'],
    onplay: () => {
      isPlaying.value = true
      isLoading.value = false
      if ('mediaSession' in navigator) {
        // Use track data if available, otherwise fallback to station info
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

function toggleMute() {
  isMuted.value = !isMuted.value

  // Apply volume change if howl is already created
  if (howl) {
    const targetVolume = isMuted.value ? 0 : volume.value
    howl.volume(targetVolume)
  }
}

function toggleMobileNav() {
  showMobileNav.value = !showMobileNav.value
}

onUnmounted(() => {
  if (howl) {
    howl.unload()
    howl = null
  }
})
</script>

<style scoped>
.radio-player-bar {
  position: fixed;
  left: 0;
  bottom: 0; /* Stick to bottom of viewport */
  width: 100%; /* Full width */
  padding: 0; /* No padding for seamless design */
  background: #0c0c0c;
  border-top:1px solid #131313;
  border-radius: 0; /* Remove rounded borders */
  flex-direction: column;
  gap: 0;
  z-index: 3000;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.player-stack {
  display: flex;
  align-items: center; /* Full height alignment */
  justify-content: space-between;
  gap: 0;
  height: 11vh; /* Fixed height for desktop */
}

.player-primary {
  display: flex;
  align-items: stretch;
  gap: 0;
  flex: 1;
}

.player-btn {
  height: 11vh;
  max-height:100%;
  aspect-ratio: 1 / 1;
  border-radius: 0; /* Squared, no rounded corners */
  border: none; /* Remove border for seamless look */
  background: #fff;
  color: #0c0c0c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}

.player-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-glow {
  display: none;
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem 1.5rem; /* Add padding only to content area */
  justify-content: center;
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.player-title {
  margin: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-status {
  margin: 0;
  color: #cbd5f5;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  width: 64px; /* Match button size */
}

.volume-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: #f8fafc;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.volume-btn:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #38bdf8;
}

.volume-btn:active {
  transform: scale(0.95);
}

@media (max-width: 720px) {
  .radio-player-bar {
    padding: 0;
    bottom: 0; /* Move back to bottom since no permanent nav */
    flex-direction: row;
    width: 100%;
    max-width: none;
    left: 0;
    transform: none;
    border-radius: 0;
  }

  .player-stack {
    flex-direction: row;
    align-items: center;
    width: 100%;
    gap: 0;
    height: 11vh;
  }

  .player-btn {
    height: 11vh;
    aspect-ratio: 1 / 1;
    border-radius: 0;
    font-size: 1.1rem;
    flex-shrink: 0;
    border: none;
  }

  .player-controls {
    display: none; /* Hide volume control on mobile */
  }

  .player-meta {
    flex: 1;
    min-width: 0;
    max-width: calc(100% - 112px); /* Reserve space for play button (64px) + more button (48px) */
    gap: 0.1rem;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden; /* Ensure content doesn't overflow */
  }

  .player-title {
    font-size: 0.9rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .player-status {
    font-size: 0.75rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-more-btn {
    width: 48px;
    height: 10vh; /* Match player height */
    border: none;
    background: transparent;
    color: #f8fafc;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0; /* Always maintain size */
    transition: all 0.2s ease;
  }

  .mobile-more-btn:hover {
    background: rgba(148, 163, 184, 0.1);
    color: #38bdf8;
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
