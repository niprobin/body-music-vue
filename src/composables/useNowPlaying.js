/**
 * Now-playing composable for shared API state management
 * Fetches current track data from AzuraCast API with efficient polling
 */

import { ref, onUnmounted } from 'vue'

const API_ENDPOINT = 'https://azuracast.niprobin.com/api/nowplaying/body_music_radio'
const POLLING_INTERVAL = 10000 // 10 seconds
const FALLBACK_ART = 'https://music.niprobin.com/radio_cover.png'

// Shared state across all components
const nowPlaying = ref(null)
const songHistory = ref([])
const isLoading = ref(false)
const error = ref(null)

// Polling management
let intervalId = null
let activeConsumers = 0

// Fetch data from API
async function fetchNowPlaying() {
  try {
    isLoading.value = true
    error.value = null

    const res = await fetch(`${API_ENDPOINT}?cb=${Date.now()}`)
    const data = await res.json()

    nowPlaying.value = data.now_playing
    songHistory.value = data.song_history?.slice(0, 10) || []

    isLoading.value = false
  } catch (err) {
    error.value = err
    isLoading.value = false
    nowPlaying.value = null
    songHistory.value = []
    console.error('Failed to fetch now playing data:', err)
  }
}

// Start polling if not already active
function startPolling() {
  activeConsumers++

  if (!intervalId) {
    // Fetch immediately, then set up polling
    fetchNowPlaying()
    intervalId = setInterval(fetchNowPlaying, POLLING_INTERVAL)
  }
}

// Stop polling if no more consumers
function stopPolling() {
  activeConsumers = Math.max(0, activeConsumers - 1)

  if (activeConsumers === 0 && intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Computed values for easy access
function getNowPlayingTrack() {
  return nowPlaying.value
}

function getTrackTitle() {
  return nowPlaying.value?.song?.title || null
}

function getTrackArtist() {
  return nowPlaying.value?.song?.artist || null
}

function getTrackArt() {
  return nowPlaying.value?.song?.art || FALLBACK_ART
}

function getSongHistory() {
  return songHistory.value
}

export function useNowPlaying() {
  // Auto-start polling when composable is used
  startPolling()

  // Cleanup on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    // Reactive state
    nowPlaying: nowPlaying,
    songHistory: songHistory,
    isLoading: isLoading,
    error: error,

    // Control functions
    startPolling,
    stopPolling,

    // Helper getters
    getNowPlayingTrack,
    getTrackTitle,
    getTrackArtist,
    getTrackArt,
    getSongHistory,

    // Constants
    FALLBACK_ART
  }
}