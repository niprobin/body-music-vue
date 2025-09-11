<template>
  <main>
    <section class="home">
      <div class="home-content">
        <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" />
        <section>
          <h1>Bienvenue sur Body Music Radio</h1>
          <p>
            Selecta réalisé par nos soins pour te faire danser &amp; chiller toute la journée&nbsp;! Tu aimes une
            track&nbsp;? Tu peux directement checker ce qui est entrain de jouer.<br><br>Tu peux également regarder notre
            planning pour savoir à quoi t'attendre sur la radio.
          </p>
        </section>
      </div>
    </section>
    <div class="svg-wave">
      <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        style="display:block; width:100%; height:80px;">
        <path fill="#d5c4b1"
          d="M0,192 C120,160 280,200 400,160 C520,120 680,200 800,180 C920,160 1080,120 1200,160 C1320,200 1440,160 1440,160 L1440,320 L0,320 Z" />
      </svg>
    </div>
    <section v-if="albumOfTheMoment" class="album-moment">
      <h2>L'album du moment</h2>
      <div class="album-moment-content">
        <div class="album-info">
          <h3 v-if="displayTitle">{{ displayTitle }}</h3>
          <div class="album-details">
            <p>Sortie le {{ albumOfTheMoment.released_in }} | Genres : {{ albumOfTheMoment.genres }}</p>
            <p class="album-summary" v-if="summaryHtml" v-html="summaryHtml"></p>
          </div>

        </div>
        <div v-if="coverUrl" class="album-artwork">
          <img :src="coverUrl" :alt="displayTitle || 'Album artwork'" />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const albumOfTheMoment = ref(null)
const CACHE_KEY = 'albumOfTheMoment_headless_cms'
const CACHE_TIME_KEY = 'albumOfTheMoment_headless_cms_time'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in ms

const EXCLUDE_FIELDS = new Set(['summary', 'id'])
const COVER_FIELD = 'image_url'
const SPOTIFY_KEYS = ['spotify_public_url', 'spotify_url', 'spotify', 'spotifyurl', 'spotify_link', 'spotify uri']

function labelFor(key) {
  const lower = String(key).toLowerCase()
  if (SPOTIFY_KEYS.includes(lower)) return 'Spotify'
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function pickValue(record, keys) {
  if (!record || typeof record !== 'object') return null
  for (const k of keys) {
    if (record[k] && String(record[k]).trim()) return record[k]
  }
  return null
}

const coverUrl = computed(() => (albumOfTheMoment.value ? albumOfTheMoment.value[COVER_FIELD] || null : null))

const displayTitle = computed(() => {
  const r = albumOfTheMoment.value
  if (!r) return ''
  return r.title || r.album || r.name || r.record || ''
})

const spotifyUrl = computed(() => (albumOfTheMoment.value ? pickValue(albumOfTheMoment.value, SPOTIFY_KEYS) : null))

// Format summary to preserve line breaks when rendering with v-html
const summaryHtml = computed(() => {
  const s = albumOfTheMoment.value?.summary
  if (!s) return ''
  return String(s)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('<br><br>')
})

const linkFields = computed(() => {
  const r = albumOfTheMoment.value
  if (!r) return []
  return Object.entries(r)
    .filter(([k, v]) => {
      if (EXCLUDE_FIELDS.has(k)) return false
      if (k === COVER_FIELD) return false
      if (SPOTIFY_KEYS.includes(String(k).toLowerCase())) return false
      if (String(k).toLowerCase() === 'title') return false
      if (typeof v !== 'string') return false
      const val = v.trim()
      return /^https?:\/\//i.test(val)
    })
    .map(([k, v]) => ({ key: k, value: v }))
})

const textFields = computed(() => {
  const r = albumOfTheMoment.value
  if (!r) return []
  return Object.entries(r)
    .filter(([k, v]) => {
      if (EXCLUDE_FIELDS.has(k)) return false
      if (k === COVER_FIELD) return false
      if (String(k).toLowerCase() === 'title') return false
      if (typeof v !== 'string') return false
      const val = v.trim()
      if (!val) return false
      return !/^https?:\/\//i.test(val)
    })
    .map(([k, v]) => ({ key: k, value: v }))
})

async function fetchAlbum() {
  try {
    const res = await fetch('https://opensheet.elk.sh/1wHGR3fbqz7nBeO8agkbzz-lTsrBEwMdTKa14iKAkNx0/headless_cms')
    const albums = await res.json()
    if (Array.isArray(albums) && albums.length > 0) {
      return albums[0] // Pick the first entry
    }
  } catch (e) {
    console.error('Failed to fetch album of the moment:', e)
  }
  return null
}

onMounted(async () => {
  const cached = localStorage.getItem(CACHE_KEY)
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
  const now = Date.now()

  let useCache = false
  if (cached && cachedTime && now - Number(cachedTime) < CACHE_DURATION) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed && parsed.summary && String(parsed.summary).trim()) {
        albumOfTheMoment.value = parsed
        useCache = true
      }
    } catch { }
  }

  if (!useCache) {
    const album = await fetchAlbum()
    if (album) {
      albumOfTheMoment.value = album
      localStorage.setItem(CACHE_KEY, JSON.stringify(album))
      localStorage.setItem(CACHE_TIME_KEY, now.toString())
    }
  }
})
</script>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: var(--primary-color);
}

.home {
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-content {
  text-align: left;
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10%;
  padding: 50px;
  background-color: var(--primary-color);
  color: var(--secondary-color);
  text-align: left;
  border-radius: 0.75rem;
}

.home-logo {
  width: 300px;
  margin-bottom: 1rem;
}

/* SVG Wave */

.svg-wave {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: #1a293d;
  position: relative;
  left: 0%;
  right: 50%;
}

.reverse {
  transform: scaleY(-1);
}

/* Album du moment CSS */
.album-moment {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: var(--secondary-color);
  padding: 2%;
}

.album-moment-content {
  text-align: left;
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  padding: 50px;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  text-align: left;
  border-radius: 0.75rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10%;
}

.album-info {
  flex: 1;
}

.album-summary {
  margin-top: 20px;
}

.album-artwork img {
  max-width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.album-artwork {
  position: relative;
  display: inline-block;
}

@media (max-width: 800px) {

  .home-content,
  .album-moment-content {
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .album-moment-content {
    flex-direction: column-reverse;
    gap: 1%;
  }

  .home-logo {
    width: 250px;
    margin: 1rem;
  }

  .album-artwork img {
    max-width: 60%;
    margin-bottom: 30px;
  }

  .overlay-spotify-btn {
    top: 8px;
    left: 8px;
    padding: 6px 10px;
    font-size: 0.9rem;
  }
}
</style>










