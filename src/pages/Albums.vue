<template>
  <section class="albums-page">
    <div class="albums-header">
      <h1>Les albums en rotation</h1>
      <p>On écoute un paquet de musique et parfois on tente de vous partager nos albums préférés !</p>
    </div>
    <div v-if="loading" class="status-card">Chargement…</div>
    <div v-else-if="error && !albums.length" class="status-card error">{{ error }}</div>

    <div v-else class="albums-sections">
      <!-- Optional: Subtle refresh indicator -->
      <div v-if="refreshing" class="refresh-indicator">↻ Mise à jour…</div>
      <!-- Reviewed Albums Section -->
      <div v-if="reviewedAlbums.length > 0" class="albums-section albums-reviewed">
        <h2 class="section-title">Nos coups de cœurs</h2>
        <div class="albums-grid">
          <article v-for="album in reviewedAlbums" :key="album.id" class="album-card">
            <router-link :to="reviewPath(album)" class="album-cover-link">
              <div class="album-cover-container">
                <img :src="album.cover_url || FALLBACK_COVER" :alt="album.release_name || 'Couverture album'"
                  class="album-cover" />
              </div>
            </router-link>
            <div class="album-meta">
              <p class="album-name">{{ album.release_name || 'Titre inconnu' }}</p>
              <p class="album-date">
                Sortie le {{ formatSheetDate(album.release_date) }}
              </p>
              <StarRating v-if="album.rating" :rating="album.rating" size="medium" />
            </div>
            <router-link :to="reviewPath(album)" class="review-button">
              Notre avis
            </router-link>
          </article>
        </div>
      </div>

      <!-- Non-Reviewed Albums Section with Tabs -->
      <div class="albums-section">
        <!-- Sticky wrapper for title and tabs -->
        <div class="albums-sticky-header">
          <h2 class="section-title">Toutes nos découvertes</h2>

          <!-- Tab Navigation -->
          <div class="albums-tabs">
          <div class="albums-tabs-container">
            <button
              v-for="(group, index) in groupedNonReviewedAlbums"
              :key="group.label"
              :class="['albums-tab', { 'albums-tab--active': activeTab === index }]"
              @click="activeTab = index"
            >
              {{ group.label }}
            </button>
          </div>
        </div>
        </div>

        <!-- Active Tab Content -->
        <div class="albums-tab-content" v-if="groupedNonReviewedAlbums[activeTab]">
          <div class="albums-grid">
            <article v-for="album in groupedNonReviewedAlbums[activeTab].items"
                     :key="album.id"
                     class="album-card">
              <a v-if="externalLink(album)"
                 :href="externalLink(album)"
                 target="_blank"
                 rel="noopener"
                 class="album-cover-link">
                <div class="album-cover-container">
                  <img :src="album.cover_url || FALLBACK_COVER"
                       :alt="album.release_name || 'Couverture album'"
                       class="album-cover" />
                </div>
              </a>
              <img v-else
                   :src="album.cover_url || FALLBACK_COVER"
                   :alt="album.release_name || 'Couverture album'"
                   class="album-cover" />
              <div class="album-meta">
                <p class="album-name">{{ album.release_name || 'Titre inconnu' }}</p>
                <p class="album-date">Sortie le {{ formatSheetDate(album.release_date) }}</p>
                <StarRating v-if="album.rating" :rating="album.rating" size="medium" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import StarRating from '../components/StarRating.vue'
import {
  LIKED_ALBUMS_URL,
  FALLBACK_COVER,
  isReviewed,
  reviewPath,
  externalLink,
  parseSheetDate,
  formatSheetDate
} from '../lib/albums.js'

const albums = ref([])
const loading = ref(false) // Start as false, set conditionally
const refreshing = ref(false) // Track background refresh
const activeTab = ref(0) // Default to first (most recent) month
const error = ref('')
const CACHE_KEY = 'albums_cache'
const CACHE_TIME_KEY = 'albums_cache_time'
const CACHE_TTL = 24 * 60 * 60 * 1000

// Storage can be blocked (private mode) or hold corrupt JSON; either way
// treat it as "no cache" so the network fetch still runs.
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    const cachedTime = Number(localStorage.getItem(CACHE_TIME_KEY))
    const isFresh = Array.isArray(cached) && Date.now() - cachedTime < CACHE_TTL
    return isFresh ? cached : null
  } catch (_) {
    return null
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list))
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
  } catch (_) {
    // Storage full or blocked: the page works without a cache.
  }
}

async function loadAlbums() {
  const cached = readCache()
  if (cached) {
    // Show cached data immediately, refresh in the background
    albums.value = cached
    refreshing.value = true
  } else {
    loading.value = true
  }

  try {
    const res = await fetch(LIKED_ALBUMS_URL)
    const data = await res.json()
    const list = Array.isArray(data) ? data : data ? [data] : []

    albums.value = list
    writeCache(list)
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

function likedTimestamp(album) {
  return parseSheetDate(album.liked_date)?.getTime() ?? -Infinity
}

function monthGroup(album) {
  const date = parseSheetDate(album.liked_date)
  if (!date) return { key: 'none', label: 'Sans date', ts: -Infinity }
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  return {
    key: `${date.getFullYear()}-${date.getMonth()}`,
    label: monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    ts: monthStart.getTime()
  }
}

const reviewedAlbums = computed(() => {
  return albums.value
    .filter(isReviewed)
    .sort((a, b) => {
      // Sort by rating desc, then by liked_date desc
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)
      if (ratingDiff !== 0) return ratingDiff
      return likedTimestamp(b) - likedTimestamp(a)
    })
})

const groupedNonReviewedAlbums = computed(() => {
  const groups = new Map()

  for (const album of albums.value.filter((a) => !isReviewed(a))) {
    const { key, label, ts } = monthGroup(album)
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

// Watch for changes in grouped albums to reset tab if needed
watch(groupedNonReviewedAlbums, (newGroups) => {
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

.albums-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding:0rem 6rem;
}

.albums-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.albums-reviewed > .albums-grid {
  border: 1px solid #F9C846;
  border-radius: 4px;
  padding: 8px 12px;
}

.section-title {
  margin: 0;
}

.albums-group {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.albums-month h3 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.album-card {
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: left;
  position: relative;
  
}

.album-cover-container {
  position: relative;
  width: 100%;
}

.album-cover {
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
  object-fit: cover;
  border:1px solid rgba(51, 51, 51, 0.5);
  -webkit-box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25); 
  box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25);
}

.album-cover-link {
  display: block;
  width: 100%;
}

.review-button {
  text-decoration: underline;
  padding:2px 4px;
  color:#fff;
  border-radius:4px;
  text-align:left;
  font-size:0.90em;
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
  width: 100%;
  padding-left:4px;
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
  border-radius: 6px;
  font-size: 0.75rem;
  z-index: 100;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

/* Sticky Header for Tabs */
.albums-sticky-header {
  position: sticky;
  top: 19vh; /* Position below header with margin */
  z-index: 500; /* Between header (1000) and default content */
  backdrop-filter: blur(6px); /* Match header blur effect */
  padding: 1rem 0 0.5rem; /* Add top padding back for coverage */
  margin: -0.5rem 0 1rem; /* Negative top margin to extend coverage */
  border-bottom: 1px solid rgba(148, 163, 184, 0.2); /* Subtle separator */
  transition: background-color 0.2s ease, backdrop-filter 0.2s ease;
}

/* Ensure the section title has no top margin when sticky */
.albums-sticky-header .section-title {
  margin-bottom: 1rem;
}

/* Tab Navigation Styles */
.albums-tabs {
  margin-bottom: 1.5rem;
}

.albums-tabs-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
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

  .albums-sections, .albums-header {
    width:100%;
    padding:0rem 2rem;
  }

  .albums-grid {
    grid-template-columns: 1fr;
  }

  .albums-sticky-header {
    top: 19vh; /* Adjust for potentially shorter mobile header with margin */
  }

  .albums-tabs-container {
    gap: 0.375rem;
  }
  .albums-tab {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
