<template>
  <section class="album-review-page">
    <div v-if="loading" class="status-card">Chargement…</div>
    <div v-else-if="error" class="status-card error">{{ error }}</div>
    <div v-else-if="!album" class="status-card error">Album non trouvé</div>

    <div v-else class="review-content">
      <!-- Navigation -->
      <nav class="review-nav">
        <router-link to="/albums" class="back-link">
          ← Retour aux albums
        </router-link>
      </nav>

      <!-- Album Header -->
      <header class="album-header">
        <div class="album-cover-section">
          <img
            :src="album.cover_url || fallbackArt"
            :alt="album.release_name || 'Couverture album'"
            class="album-cover-large"
          />
        </div>
        <div class="album-info">
          <h1>{{ album.release_name || 'Titre inconnu' }}</h1>
          <p class="album-details">
            Sortie le {{ formatReleaseDate(album.release_date) }}
          </p>
          <div class="album-rating" v-if="album.rating">
            <span
              v-for="n in 5"
              :key="n"
              :class="['album-star', { 'album-star--filled': n <= album.rating }]"
            >★</span>
            <span class="rating-text">{{ album.rating }}/5</span>
          </div>
          <div class="album-links">
            <a v-if="getExternalLink(album)"
               :href="getExternalLink(album)"
               target="_blank"
               rel="noopener"
               class="external-link">
              Découvrir l'album →
            </a>
          </div>
        </div>
      </header>

      <!-- Review Text -->
      <main class="review-main">
        <div class="review-text" v-html="formattedReviewText"></div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const album = ref(null)
const loading = ref(true)
const error = ref('')
const fallbackArt = 'https://music.niprobin.com/radio_cover.png'

async function loadAlbum() {
  try {
    const slug = route.params.slug
    if (!slug) {
      error.value = 'Slug d\'album manquant'
      return
    }

    // Fetch all albums to find the one with matching slug
    const res = await fetch('https://n8n.niprobin.com/webhook/liked-albums')
    const data = await res.json()
    const albums = Array.isArray(data) ? data : data ? [data] : []

    // Find album by slug
    const foundAlbum = albums.find(a => a.slug === slug && a.has_review)

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

// Format review text with basic HTML support
const formattedReviewText = computed(() => {
  if (!album.value?.text) return ''

  // Convert newlines to paragraphs and preserve basic formatting
  return album.value.text
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
})

function formatReleaseDate(value) {
  if (!value) return 'Date inconnue'
  const [day, month, year] = String(value).split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(dateObj.getTime())) return value
  return dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getExternalLink(album) {
  if (!album) return ''
  const discogs = (album.discogs_url || '').trim()
  const spotify = (album.spotify_url || '').trim()
  const hasCompleteDiscogs =
    discogs && (discogs.includes('/release') || discogs.includes('/master'))
  if (hasCompleteDiscogs) {
    return discogs
  }
  if (discogs === 'https://www.discogs.com' && spotify) {
    return spotify
  }
  if (!discogs && spotify) {
    return spotify
  }
  return ''
}

function getExternalLinkText(album) {
  const link = getExternalLink(album)
  if (link.includes('discogs.com')) return 'Discogs'
  if (link.includes('spotify.com')) return 'Spotify'
  return 'Site externe'
}

// TODO: Add meta tags for SEO when SSG setup is complete
</script>

<style scoped>
.album-review-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem 4rem;
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
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .album-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
}

.album-cover-large {
  width: 100%;
  height: auto;
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 12px;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.album-info h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .album-info h1 {
    font-size: 1.5rem;
  }
}

.album-details {
  margin: 0;
  color: #94a3b8;
  font-size: 1rem;
}

.album-rating {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  font-size: 1.2rem;
}

.album-star {
  color: #475569;
}

.album-star--filled {
  color: #facc15;
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
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.external-link:hover {
  color: #93c5fd;
}

.review-main {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(148, 163, 184, 0.1);
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
</style>