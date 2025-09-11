<template>
  <section class="last-songs">
    <div>
      <h1>Dernières tracks jouées</h1>
      <div class="history-container">
        <div v-if="nowPlaying" class="song-card now-playing">
          <img class="song-artwork" :src="nowPlaying.song.art || fallbackArt" alt="Album cover" />
          <div class="song-info">
            <p class="song-title">{{ nowPlaying.song.title || "Unknown Title" }}</p>
            <p class="song-artist">{{ nowPlaying.song.artist || "Unknown Artist" }}</p>
            <p class="song-played-at">En ce moment</p>
          </div>
        </div>
        <div v-for="entry in filteredHistory" :key="entry.played_at" class="song-card">
          <img class="song-artwork" :src="entry.song.art || fallbackArt" alt="Album cover" />
          <div class="song-info">
            <p class="song-title">{{ entry.song.title || "Unknown Title" }}</p>
            <p class="song-artist">{{ entry.song.artist || "Unknown Artist" }}</p>
            <p class="song-played-at">{{ formatPlayedAt(entry.played_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const nowPlaying = ref(null)
const history = ref([])
const fallbackArt = 'https://music.niprobin.com/radio_cover.png'

function formatPlayedAt(ts) {
  const date = new Date(ts * 1000)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const hours = date.getHours().toString().padStart(2, "0")
  const mins = date.getMinutes().toString().padStart(2, "0")
  return isToday
    ? `Aujourd'hui à ${hours}h${mins}`
    : `${date.toLocaleDateString()} à ${hours}h${mins}`
}

const filteredHistory = computed(() => {
  if (!nowPlaying.value) return history.value
  // Avoid duplicate if current song is also first in history
  return history.value.filter(
    entry =>
      !(
        entry.song?.title === nowPlaying.value.song?.title &&
        entry.song?.artist === nowPlaying.value.song?.artist
      )
  )
})

async function fetchSongs(force = false) {
  try {
    const res = await fetch("https://azuracast.niprobin.com/api/nowplaying/body_music_radio?cb=" + Date.now())
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
  fetchSongs(true)
  setInterval(() => fetchSongs(false), 10000)
})
</script>

<style scoped>
.last-songs {
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  margin: 0 auto;
   padding: 100px 0px;
}

.history-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.song-card {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  text-align: left;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

img.song-artwork {
  width: 100px;
  height: 100px;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  background: #444;
  object-fit: cover;
}

.song-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  gap: 0px;
}

.song-title {
  font-weight: bold;
}

.song-played-at {
  font-size: 0.7rem;
  text-transform: uppercase;
  text-decoration: underline;
  margin-top: 25px;
}

/* Responsive Design */
@media (max-width: 800px) {
  h1 {
    width: 100%;
    text-align: center;
  }

  .last-songs {
    width: 100%;
    padding: 0px 0px 92px 0px;
    margin: 0 auto;
  }

  .history-container {
    width: 100%;
    gap: 10px;
  }

  .song-card {
    flex-direction: row;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
  }

}
</style>