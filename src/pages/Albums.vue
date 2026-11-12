<template>
  <section class="albums-page">
    <div class="albums-header">
      <h1>Les albums en rotation</h1>
      <p>On écoute un paquet de musique et parfois on tente de vous partager nos albums préférés !</p>
    </div>
    <div v-if="loading" class="albums-content">
      <div class="status-card">Chargement…</div>
    </div>
    <div v-else-if="error && !albums.length" class="albums-content">
      <div class="status-card error">{{ error }}</div>
    </div>

    <div v-else class="albums-content">
      <div v-if="refreshing" class="refresh-indicator">↻ Mise à jour…</div>
      <div class="albums-wall">
        <template v-for="group in albumsByMonth" :key="group.key">
          <h2 :id="`mois-${group.key}`" class="albums-month">
            <span class="albums-month__label">{{ group.label }}</span>
          </h2>
          <AlbumTile
            v-for="album in group.items"
            :key="album.deezer_id || album.release_name"
            :album="album"
            :mobile="isMobile"
          />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AlbumTile from '../components/AlbumTile.vue'
import { useIsMobile } from '../composables/useIsMobile.js'
import { groupByMonth, readCachedAlbums, fetchLikedAlbums } from '../lib/albums.js'

const albums = ref([])
const loading = ref(false) // Start as false, set conditionally
const refreshing = ref(false) // Track background refresh
const error = ref('')
const isMobile = useIsMobile()

async function loadAlbums() {
  const cached = readCachedAlbums()
  if (cached) {
    // Show cached data immediately, refresh in the background
    albums.value = cached
    refreshing.value = true
  } else {
    loading.value = true
  }

  try {
    albums.value = await fetchLikedAlbums()
  } catch (err) {
    console.error('Error loading albums:', err)
    if (!albums.value.length) { // Only show error if no cached data
      error.value = 'Impossible de charger les albums.'
    }
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(loadAlbums)

const albumsByMonth = computed(() => groupByMonth(albums.value))

</script>

<style scoped>
.albums-page {
  max-width: 100%;
  padding-bottom:5vh;
}

.albums-header {
  margin-bottom: 1.5rem;
  padding:2rem 6rem;
}

.albums-header p {
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







.albums-content {
  padding: 0 6rem;
}

.refresh-indicator {
  margin-bottom: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

.albums-wall {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

/* Month divider: full-width row inside the grid */
.albums-month {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 0.5rem;
  font-family: 'Gochi Hand', 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 400;
  text-transform: uppercase;
  color: #f3efe8;
  /* Land below the sticky header player when jumped to */
  scroll-margin-top: calc(19vh + 1rem);
}

.albums-month:first-child {
  margin-top: 0;
}

.albums-month::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.25);
}

@media (max-width: 720px) {
  .albums-content, .albums-header {
    width: 100%;
    padding: 0 2rem;
  }

  .albums-wall {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .albums-month {
    font-size: 22px;
    margin-top: 1.25rem;
  }
}
</style>
