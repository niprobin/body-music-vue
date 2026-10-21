/**
 * Now-playing composable for shared media-session metadata.
 *
 * Reads from /api/nowplaying (a proxy over Icecast's status-json.xsl).
 * Never calls AzuraCast's nowplaying API: its Liquidsoap 2.4.5
 * replay_metadata bug freezes song metadata on new-track inserts, making it
 * an unreliable source for what's actually on air.
 */

import { ref, onUnmounted } from 'vue'
import { createPoller } from '../lib/poller.js'

const POLLING_INTERVAL = 15000 // 15 seconds

// Shared state across all components
const nowPlaying = ref(null)
const isLoading = ref(false)
const error = ref(null)

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

const poller = createPoller(fetchNowPlaying, POLLING_INTERVAL)
let activeConsumers = 0
let visibilityHandlerAttached = false

// Pause polling while the tab is hidden, resume on return.
function handleVisibilityChange() {
  if (document.hidden) {
    poller.stop()
  } else if (activeConsumers > 0) {
    poller.start()
  }
}

export function useNowPlaying() {
  activeConsumers++
  poller.start()

  if (!visibilityHandlerAttached) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    visibilityHandlerAttached = true
  }

  onUnmounted(() => {
    activeConsumers = Math.max(0, activeConsumers - 1)
    if (activeConsumers === 0) poller.stop()
  })

  return {
    nowPlaying,
    isLoading,
    error
  }
}
