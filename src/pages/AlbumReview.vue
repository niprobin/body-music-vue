<template>
  <section class="album-review-page">
    <div v-if="loading" class="status-card">Chargement…</div>
    <div v-else-if="error" class="status-card error">{{ error }}</div>
    <div v-else-if="!album" class="status-card error">Album non trouvé</div>

    <div v-else class="review-content">
      <!-- Album Header -->
      <header class="album-header">
        <div class="album-cover-section">
          <img
            :src="album.cover_url || FALLBACK_COVER"
            :alt="album.release_name || 'Couverture album'"
            class="album-cover-large"
          />
        </div>
        <div class="album-info">
          <h2>{{ album.release_name || 'Titre inconnu' }}</h2>
          <div class="album-details">
            <p>
            Sortie le {{ formatSheetDate(album.release_date) }}
          </p>
          <p>—</p>
          <p v-if="album.liked_date">
            Écouté le {{ formatSheetDate(album.liked_date) }}
          </p>
          </div>
          <div class="album-rating" v-if="album.rating"><StarRating :rating="album.rating" size="large" /></div>
          <div class="album-links">
            <a v-if="externalLink(album)"
               :href="externalLink(album)"
               target="_blank"
               rel="noopener"
               class="external-link">
              En savoir plus
            </a>
          </div>
        </div>
      </header>

      <!-- Review Text -->
      <main class="review-main">
        <div class="review-text">
          <p v-for="(lines, idx) in reviewText" :key="idx">
            <template v-for="(line, lineIdx) in lines" :key="lineIdx">
              <br v-if="lineIdx > 0" />{{ line }}
            </template>
          </p>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StarRating from '../components/StarRating.vue'
import {
  LIKED_ALBUMS_URL,
  FALLBACK_COVER,
  isReviewed,
  externalLink,
  formatSheetDate,
  reviewParagraphs
} from '../lib/albums.js'

const route = useRoute()

const album = ref(null)
const loading = ref(true)
const error = ref('')

async function loadAlbum() {
  try {
    const slug = route.params.slug
    if (!slug) {
      error.value = 'Slug d\'album manquant'
      return
    }

    // Fetch all albums to find the one with matching slug
    const res = await fetch(LIKED_ALBUMS_URL)
    const data = await res.json()
    const albums = Array.isArray(data) ? data : data ? [data] : []

    const foundAlbum = albums.find(a => a.slug === slug && isReviewed(a))

    if (!foundAlbum) {
      error.value = 'Album non trouvé ou sans review'
      return
    }

    album.value = foundAlbum
  } catch (err) {
    error.value = 'Impossible de charger l\'album'
    console.error('Error loading album:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadAlbum)

// Rendered as text nodes, so markup in the sheet is shown literally.
const reviewText = computed(() => reviewParagraphs(album.value?.text))
</script>

<style scoped>
.album-review-page {
  max-width: 100%;
  margin: 2rem auto;
  padding:2rem 6rem;
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

.review-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-nav {
  margin-bottom: 1rem;
}

.back-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #e2e8f0;
}

.album-header {
  display: flex;
  gap: 2rem;
  align-items: start;
}

.album-cover-section {
  width:320px;
  max-width:320px;
}

.album-cover-large {
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
  object-fit: cover;
  border:1px solid rgba(51, 51, 51, 0.5);
  -webkit-box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25); 
  box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25);
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.album-info h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  font-family: 'Inter','sans-serif' !important;
}

.album-details {
  display:flex;
  gap:1rem;
  width:100%;
  margin: 0;
  color: #94a3b8;
  font-size: 1rem;
}

.album-details p {
  line-height:1;
}

.album-rating {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  font-size: 1.2rem;
}

.rating-text {
  margin-left: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

.album-links {
  display: flex;
  gap: 1rem;
}

.external-link {
  background-color: #111;
  border: 1px solid #f3efe8;
  border-radius: 4px;
  color: #f3efe8;
  cursor: pointer;
  font-family: 'Inter',sans-serif;
  font-size: 14px;
  display:flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: pre;
  width: auto;
}

.review-main {
  color: #f3efe8;
  padding: 1rem 0rem;
}

.review-text {
  line-height: 1.7;
  font-size: 1rem;
}

.review-text :deep(p) {
  margin: 0 0 1.5rem 0;
}

.review-text :deep(p:last-child) {
  margin-bottom: 0;
}

@media (max-width: 720px) {

  p {font-size:1.1rem;}

  .album-header {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  .album-info {
    align-items: center;
  }

  .album-details {
    flex-direction: column;
    gap:0rem;
    align-items: center;
  }

  .album-details p:nth-child(2) {
    display:none;
  }

  .album-review-page {
    padding:2rem;
  }

  .album-header {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      text-align: center;
    }
}
</style>