<template>
  <section class="albums-page">
    <div class="albums-header">
      <h1>Nos albums préférés</h1>
      <p>On écoute un paquet de musique et parfois on tente de vous partager nos albums préférés !</p>
    </div>

    <div v-if="loading" class="status-card">Chargement…</div>
    <div v-else-if="error" class="status-card error">{{ error }}</div>

    <div v-else class="albums-group">
      <div v-for="group in groupedAlbums" :key="group.label" class="albums-month">
        <h2>{{ group.label }}</h2>
        <div class="albums-grid">
          <article v-for="album in group.items" :key="album.id" class="album-card">
            <img :src="album.cover_url || fallbackArt" :alt="album.release_name || 'Couverture album'"
              class="album-cover" />
            <div class="album-meta">
              <p class="album-name">{{ album.release_name || 'Titre inconnu' }}</p>
              <p class="album-date">
                Sortie le {{ formatReleaseDate(album.release_date) }}
              </p>
              <div class="album-rating" v-if="album.rating">
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="['album-star', { 'album-star--filled': n <= album.rating }]"
                >★</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const albums = ref([])
const loading = ref(true)
const error = ref('')
const fallbackArt = 'https://music.niprobin.com/radio_cover.png'

async function loadAlbums() {
  try {
    const res = await fetch('https://n8n.niprobin.com/webhook/liked-albums')
    const data = await res.json()
    albums.value = Array.isArray(data) ? data : data ? [data] : []
  } catch (err) {
    error.value = 'Impossible de charger les albums.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAlbums)

const groupedAlbums = computed(() => {
  const groups = new Map()

  const parseMonthKey = (album) => {
    const raw = album.liked_date
    if (!raw) return { key: 'none', label: 'Sans date', ts: -Infinity }
    const [day, month, year] = String(raw).split('-')
    const monthIndex = Number(month) - 1
    const dateObj = new Date(Number(year), monthIndex, 1)
    if (Number.isNaN(dateObj.getTime())) return { key: 'none', label: 'Sans date', ts: -Infinity }
    const label = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return {
      key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
      label,
      ts: dateObj.getTime()
    }
  }

  for (const album of albums.value) {
    const { key, label, ts } = parseMonthKey(album)
    if (!groups.has(key)) {
      groups.set(key, { label, ts, items: [] })
    }
    groups.get(key).items.push(album)
  }

  return [...groups.values()]
    .sort((a, b) => b.ts - a.ts)
    .map(group => ({
      label: group.label,
      items: [...group.items].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    }))
})

function formatReleaseDate(value) {
  if (!value) return 'Date inconnue'
  const [day, month, year] = String(value).split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(dateObj.getTime())) return value
  return dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.albums-page {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem 4rem;
}

.albums-header {
  margin-bottom: 1.5rem;
}

.albums-header p {
  color: #94a3b8;
  margin: 0.25rem 0 0;
}

.status-card {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(15, 23, 42, 0.7);
  text-align: center;
}

.status-card.error {
  color: #fecaca;
  border-color: rgba(248, 113, 113, 0.5);
}

.albums-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.albums-month h2 {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .albums-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .albums-grid {
    grid-template-columns: 1fr;
  }
}

.album-card {
  background: rgba(15, 23, 42, 0.75);
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  position: relative;
  background:#0b101d;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.album-cover {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  object-fit: cover;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  text-align: left;
  width: 100%;
}

.album-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.album-date {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}

.album-rating {
  display: flex;
  gap: 0.15rem;
  font-size: 0.95rem;
  align-items: center;
}

.album-star {
  color: #475569;
}

.album-star--filled {
  color: #facc15;
}
</style>
