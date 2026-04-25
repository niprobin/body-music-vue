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
import { computed } from 'vue'
import { useNowPlaying } from '../composables/useNowPlaying.js'

const { nowPlaying, songHistory, FALLBACK_ART } = useNowPlaying()
const fallbackArt = FALLBACK_ART

function formatPlayedAt(ts) {
  const date = new Date(ts * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')
  return isToday ? `Aujourd'hui à ${hours}h${mins}` : `${date.toLocaleDateString()} à ${hours}h${mins}`
}

const filteredHistory = computed(() => {
  if (!nowPlaying.value) return songHistory.value
  return songHistory.value.filter(
    entry =>
      !(
        entry.song?.title === nowPlaying.value.song?.title &&
        entry.song?.artist === nowPlaying.value.song?.artist
      )
  )
})

// Note: All API fetching and polling is now handled by the useNowPlaying composable
</script>

<style scoped>
.last-songs {
  max-width: 100%;
  margin: 2rem auto;
  padding:0rem 6rem;
  padding-bottom:5vh;
}

.last-songs__header {
  margin-bottom: 1.5rem;
}

.last-songs__header p {
  margin: 0.2rem 0 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  border:1px solid rgba(70, 69, 69, 0.95);
  border-radius: 16px;
  overflow: hidden;
}

.history-item {
  display: grid;
  grid-template-columns: 75px 1fr 120px;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-bottom:1px solid rgba(70, 69, 69, 0.95);
}

.history-item:last-child {
  border-bottom: none;
}



.history-cover {
  width: 75px;
  height: 75px;
  border-radius: 6px;
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
  color: #f3efe8;
}

.history-artist {
  margin: 0;
  color: #fff;
  font-size: 0.95rem;
}

.history-time,
.history-tag {
  font-size: 0.85rem;
  color: #f3efe8;
}

.history-tag {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  border: 1px solid #f3efe8;
  background-color: #f3efe8;
  color:#111;
}

@media (max-width: 640px) {

  .last-songs {
  max-width: 100%;
  margin: 2rem auto;
  padding:0rem 2rem;
}

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
