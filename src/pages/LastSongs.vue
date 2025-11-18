<template>
  <section class="last-songs">
    <div class="last-songs__header">
      <h1>Dernières tracks jouées</h1>
      <p>Tu aimes le dernier son que t'as entendu ? Tu le trouves ici fastoche.</p>
    </div>
    <div class="history-list">
      <div v-if="nowPlaying" class="history-item current">
        <img class="history-cover" :src="nowPlaying.song.art || fallbackArt" alt="Album cover" />
        <div class="history-meta">
          <div class="history-row">
            <p class="history-title">{{ nowPlaying.song.title || 'Unknown Title' }}</p>
            <span class="history-tag">En ce moment</span>
          </div>
          <p class="history-artist">{{ nowPlaying.song.artist || 'Unknown Artist' }}</p>
        </div>
      </div>
      <div v-for="entry in filteredHistory" :key="entry.played_at" class="history-item">
        <img class="history-cover" :src="entry.song.art || fallbackArt" alt="Album cover" />
        <div class="history-meta">
          <div class="history-row">
            <p class="history-title">{{ entry.song.title || 'Unknown Title' }}</p>
            <span class="history-time">{{ formatPlayedAt(entry.played_at) }}</span>
          </div>
          <p class="history-artist">{{ entry.song.artist || 'Unknown Artist' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const nowPlaying = ref(null)
const history = ref([])
const fallbackArt = 'https://music.niprobin.com/radio_cover.png'
let intervalId

function formatPlayedAt(ts) {
  const date = new Date(ts * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return isToday ? `Aujourd'hui à ${hours}h${mins}` : `${date.toLocaleDateString()} à ${hours}h${mins}`
}

const filteredHistory = computed(() => {
  if (!nowPlaying.value) return history.value
  return history.value.filter(
    entry =>
      !(
        entry.song?.title === nowPlaying.value.song?.title &&
        entry.song?.artist === nowPlaying.value.song?.artist
      )
  )
})

async function fetchSongs() {
  try {
    const res = await fetch('https://azuracast.niprobin.com/api/nowplaying/body_music_radio?cb=' + Date.now())
    const data = await res.json()
    nowPlaying.value = data.now_playing
    history.value = data.song_history.slice(0, 10)
  } catch (err) {
    history.value = []
    nowPlaying.value = null
    console.error(err)
  }
}

onMounted(() => {
  fetchSongs()
  intervalId = setInterval(() => fetchSongs(), 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.last-songs {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem 4rem;
}

.last-songs__header {
  margin-bottom: 1.5rem;
}

.last-songs__header p {
  color: #94a3b8;
  margin: 0.2rem 0 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  overflow: hidden;
}

.history-item {
  display: grid;
  grid-template-columns: 75px 1fr 120px;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item.current {
  background: rgba(56, 189, 248, 0.1);
  border-bottom-color: rgba(56, 189, 248, 0.3);
}

.history-cover {
  width: 75px;
  height: 75px;
  border-radius: 12px;
  object-fit: cover;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.history-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.history-row span {
  flex-shrink: 0;
}

.history-title {
  margin: 0;
  font-weight: 600;
  color: #f8fafc;
}

.history-artist {
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.history-time,
.history-tag {
  font-size: 0.85rem;
  color: #cbd5f5;
}

.history-tag {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

@media (max-width: 640px) {
  .history-item {
    grid-template-columns: 75px 1fr;
    grid-template-rows: auto auto;
    gap: 0.6rem;
  }

  .history-cover {
    width: 60px;
    height: 60px;
  }

  .history-time,
  .history-tag {
    justify-self: flex-start;
  }
}
</style>
