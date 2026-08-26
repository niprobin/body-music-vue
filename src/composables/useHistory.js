/**
 * History composable — reads recently played tracks from /api/history,
 * a proxy over an n8n webhook backed by a datatable (source of truth for
 * track history; see api/history.js for why AzuraCast's API isn't used).
 */

import { ref, onMounted, onUnmounted } from 'vue'

const POLLING_INTERVAL = 15000 // 15 seconds

export function useHistory() {
  const tracks = ref([])
  const isLoading = ref(true)
  const hasLoadedOnce = ref(false)

  let intervalId = null

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()

      if (data.ok && Array.isArray(data.tracks)) {
        tracks.value = data.tracks
      }
      // On ok:false, keep the last known list rather than clearing it —
      // a transient n8n outage shouldn't make the history disappear.
    } catch (err) {
      // Network error: keep the last known list.
    } finally {
      isLoading.value = false
      hasLoadedOnce.value = true
    }
  }

  function startInterval() {
    if (!intervalId) {
      fetchHistory()
      intervalId = setInterval(fetchHistory, POLLING_INTERVAL)
    }
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopInterval()
    } else {
      startInterval()
    }
  }

  onMounted(() => {
    startInterval()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    stopInterval()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    tracks,
    isLoading,
    hasLoadedOnce
  }
}
