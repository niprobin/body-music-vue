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

    <template v-else>
      <!-- Month tabs: full width, sticky under the header player -->
      <nav class="albums-tabs" aria-label="Mois">
        <div class="albums-tabs-container">
          <button
            v-for="(group, index) in albumsByMonth"
            :key="group.key"
            :class="['albums-tab', { 'albums-tab--active': activeTab === index }]"
            @click="activeTab = index"
          >
            {{ group.label }}
          </button>
        </div>
      </nav>

      <div class="albums-content">
        <div v-if="refreshing" class="refresh-indicator">↻ Mise à jour…</div>
        <div class="albums-tab-content" v-if="albumsByMonth[activeTab]">
          <div class="albums-grid">
            <AlbumCard v-for="album in albumsByMonth[activeTab].items"
                       :key="album.deezer_id || album.release_name"
                       :album="album" />
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AlbumCard from '../components/AlbumCard.vue'
import { groupByMonth, readCachedAlbums, fetchLikedAlbums } from '../lib/albums.js'

const albums = ref([])
const loading = ref(false) // Start as false, set conditionally
const refreshing = ref(false) // Track background refresh
const activeTab = ref(0) // Default to first (most recent) month
const error = ref('')

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

// Watch for changes in grouped albums to reset tab if needed
watch(albumsByMonth, (newGroups) => {
  if (newGroups.length > 0 && activeTab.value >= newGroups.length) {
    activeTab.value = 0
  }
}, { immediate: true })
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







.albums-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.albums-content {
  padding: 0 6rem;
}

/* Month tabs: full width, sticky just below the header player (top 1vh + 18vh) */
.albums-tabs {
  position: sticky;
  top: 19vh;
  z-index: 500;
  margin-bottom: 1.5rem;
  background-color: rgba(21, 35, 49, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}


.albums-tabs-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.75rem 6rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.albums-tabs-container::-webkit-scrollbar {
  display: none;
}

.albums-tab {
  flex-shrink: 0;
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(70, 69, 69, 0.95);
  color: #f3efe8;
  background:transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 400;
  white-space: nowrap;
}

.albums-tab--active {
  background: #f3efe8;
  border-color: #f3efe8;
  color: #111;
  font-weight: 500;
}

.albums-tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@media (max-width: 720px) {

  .albums-content, .albums-header {
    width:100%;
    padding:0rem 2rem;
  }

  .albums-grid {
    grid-template-columns: 1fr;
  }

  .albums-tabs-container {
    gap: 0.375rem;
    padding: 0.625rem 2rem;
  }
  .albums-tab {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
