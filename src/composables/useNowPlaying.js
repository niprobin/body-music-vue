/**
 * Now-playing composable for shared media-session metadata.
 *
 * Reads from /api/nowplaying (a proxy over Icecast's status-json.xsl).
 * Never calls AzuraCast's nowplaying API: its Liquidsoap 2.4.5
 * replay_metadata bug freezes song metadata on new-track inserts, making it
 * an unreliable source for what's actually on air.
 */

import { ref, onUnmounted } from 'vue'

const POLLING_INTERVAL = 15000 // 15 seconds
const FALLBACK_ART = '/browser_icon.png'

// Shared state across all components
const nowPlaying = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Polling management
let intervalId = null
let activeConsumers = 0
let visibilityHandlerAttached = false

// Fetch data from the proxy
async function fetchNowPlaying() {
  try {
    isLoading.value = true

    const res = await fetch('/api/nowplaying')
    const data = await res.json()

    if (data.ok) {
      nowPlaying.value = { artist: data.artist, title: data.title }
      error.value = null
    }
    // On ok:false, keep the last known value rather than clearing it.
  } catch (err) {
    error.value = err
    // Network error: keep the last known value.
  } finally {
    isLoading.value = false
  }
}

function startInterval() {
  if (!intervalId) {
    fetchNowPlaying()
    intervalId = setInterval(fetchNowPlaying, POLLING_INTERVAL)
  }
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Start polling if not already active
function startPolling() {
  activeConsumers++
  startInterval()
}

// Stop polling if no more consumers
function stopPolling() {
  activeConsumers = Math.max(0, activeConsumers - 1)

  if (activeConsumers === 0) {
    stopInterval()
  }
}

// Pause polling while the tab is hidden, resume on return.
function handleVisibilityChange() {
  if (document.hidden) {
    stopInterval()
  } else if (activeConsumers > 0) {
    startInterval()
  }
}

// Helper getters
function getTrackTitle() {
  return nowPlaying.value?.title || null
}

function getTrackArtist() {
  return nowPlaying.value?.artist || null
}

function getTrackArt() {
  return FALLBACK_ART
}

export function useNowPlaying() {
  // Auto-start polling when composable is used
  startPolling()

  if (!visibilityHandlerAttached) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    visibilityHandlerAttached = true
  }

  // Cleanup on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    // Reactive state
    nowPlaying: nowPlaying,
    isLoading: isLoading,
    error: error,

    // Control functions
    startPolling,
    stopPolling,

    // Helper getters
    getTrackTitle,
    getTrackArtist,
    getTrackArt,

    // Constants
    FALLBACK_ART
  }
}
