<template>
  <main class="homepage">
    <section class="hero">
      <div class="hero-content">
        <!-- <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" /> -->
        <div class="hero-text">
          <h2>On est pas bien là ?</h2>
          <p>
            Toute la musique qu'on aime sans interruption et sans pubs pour ton plaisir auditif. On commence tout doucement le matin pour se réveiller tranquillement, avant de groover tout le reste de la journée !<br><br>
            On ajoute des nouvelles tracks au fur et à mesure de nos découvertes.<br><br>
            Si tu cherches ton nouvel album préféré, tu peux jeter un oeil à la collection qu'on partage.<br><br>
            <b>Body Music Radio te souhaite une très bonne écoute !</b>
          </p>
        </div>
      </div>
    </section>

    <section v-if="loading || albums.length" class="recent-albums">
      <div class="section-header">
        <h2>Nos albums du moment</h2>
        <router-link to="/albums" class="more-albums">
          Découvrir plus d'albums&ensp;<LucideIcon icon="arrow-right" />
        </router-link>
      </div>
      <div class="recent-albums-grid" :aria-busy="loading">
        <template v-if="loading">
          <div v-for="n in ALBUM_COUNT" :key="n" class="album-skeleton" aria-hidden="true">
            <div class="skeleton-cover"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </template>
        <AlbumCard v-else
                   v-for="album in albums"
                   :key="albumKey(album)"
                   :album="album" />
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LucideIcon from '../components/LucideIcon.vue'
import AlbumCard from '../components/AlbumCard.vue'
import { readCachedAlbums, fetchLikedAlbums, recentTopAlbums } from '../lib/albums.js'

const ALBUM_COUNT = 4

const albums = ref([])
const loading = ref(true)

function select(list) {
  return recentTopAlbums(list, { count: ALBUM_COUNT, minRating: 4 })
}

// Show the cached list at once, then refresh it from the network.
// On failure with nothing cached, the section stays hidden.
async function loadAlbums() {
  const cached = readCachedAlbums()
  if (cached) {
    albums.value = select(cached)
    loading.value = false
  }
  try {
    albums.value = select(await fetchLikedAlbums())
  } catch (err) {
    console.error('Error loading albums:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadAlbums)
</script>

<style scoped>

/* STYLES FOR THE HERO SECTION ON THE HOMEPAGE */

.homepage {
  max-width: 100%;
}

.hero {
  display: flex;
  justify-content: center;
  width:100%;
  padding:2rem 6rem;
  /* border-bottom: 1px solid rgba(70, 69, 69, 0.95); */
}

.hero-content {
  display: flex;
  align-items:start;
  width: 100%;
}

.hero-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

/* RECENT ALBUMS SECTION */

.recent-albums {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 6rem;
}

.recent-albums > .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

h2 {
  margin: 0;
}

.more-albums {
  background: transparent;
  border: 1px solid #f3efe8;
  border-radius: 4px;
  color: #f3efe8;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  text-decoration: none;
  white-space: pre;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.recent-albums-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.album-skeleton {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-cover,
.skeleton-line {
  background: rgba(148, 163, 184, 0.15);
  border-radius: 0.25rem;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-cover {
  aspect-ratio: 1;
  width: 100%;
}

.skeleton-line {
  height: 0.8rem;
  width: 80%;
}

.skeleton-line--short {
  width: 50%;
}

@keyframes pulse {
  50% { opacity: 0.5; }
}

@media (max-width: 720px) {

  p {font-size:1.1rem;}

  .hero {
    padding: 2rem;
    margin:0;
    width:100%;
  }

  .hero-content {
    padding:0;
    margin:0;
    width:100%;
  }

  .hero-text {
    text-align: center;
  }

  .home-logo {
    max-width: 60%;
  }

  .recent-albums {
    padding: 2rem;
  }

  .recent-albums > .section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .recent-albums-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.25rem;
  }

  .recent-albums-grid :deep(.album-card),
  .album-skeleton {
    padding: 0.5rem;
  }
}
</style>
