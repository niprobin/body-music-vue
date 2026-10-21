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

    <section class="featured-placeholder" v-if="loadingFeatured">
      <p>Chargement en cours…</p>
    </section>

    <section id="featured-album" class="featured-album" v-else-if="featuredAlbum">
      <div class="section-header">
      <h2>Ton prochain coup de coeur</h2>
      <router-link to="/albums">
          <button class="more-albums">Découvrir plus d'albums&ensp;<LucideIcon icon="arrow-right" /></button>
        </router-link>
        </div>
      <div class="section-content">
        <div class="featured-cover">
          <img :src="featuredAlbum.cover_url || FALLBACK_COVER" :alt="featuredAlbum.release_name || 'Album du moment'" />
      </div>
      <div class="featured-info">
        <h3>{{ featuredAlbum.release_name }} </h3>
        <div class="featured-meta">
          <p class="featured-date">Sortie le {{ formatSheetDate(featuredAlbum.release_date) }}
        </p>
        <p class="featured-genre">{{ featuredAlbum.genre || 'Genre inconnu' }}</p>
        </div>
        <div class="featured-text">
          <p v-for="(paragraph, idx) in formattedText" :key="idx">
            {{ paragraph }}
          </p>
        </div>
      </div>
      </div>
    </section>

    <section class="featured-placeholder" v-else>
      <p>Pas d'album du moment pour l'instant.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LucideIcon from '../components/LucideIcon.vue'
import { FALLBACK_COVER, formatSheetDate } from '../lib/albums.js'

const featuredAlbum = ref(null)
const loadingFeatured = ref(true)

const formattedText = computed(() => {
  if (!featuredAlbum.value?.text) return []
  return String(featuredAlbum.value.text)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
})

async function loadFeaturedAlbum() {
  try {
    const res = await fetch('https://n8n.niprobin.com/webhook/featured-album')
    const data = await res.json()
    featuredAlbum.value = data && typeof data === 'object' ? data : null
  } catch (_) {
    featuredAlbum.value = null
  } finally {
    loadingFeatured.value = false
  }
}

onMounted(loadFeaturedAlbum)
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

/* STYLES FOR THE FEATURED ALBUM SECTION ON THE HOMEPAGE */

.featured-album {
  /* border-top:1px solid rgba(70, 69, 69, 0.95); */
  width:100%;
  display:flex;
  flex-direction: column;
  gap: 2rem;
  padding:2rem 6rem;
}

/* HEADER OF THE FEATURED SECTION (CTA) */

.featured-album > .section-header {
 display:flex;
 justify-content: space-between;
 align-items: center;
}

.more-albums {
  background: transparent;
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

/* HEADER OF THE FEATURED SECTION (ALBUM) */

.featured-album > .section-content {
  display: flex;
  gap: 2rem;
  align-items: start;
  justify-content: top;
}

#featured-album {
  scroll-margin-top: 19vh;
}

.featured-cover img {
  max-width: 320px;
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
  object-fit: cover;
  border:1px solid rgba(51, 51, 51, 0.5);
  -webkit-box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25); 
  box-shadow: 2px 4px 4px 0px rgba(0,0,0,0.25);
}

.featured-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h2 {
  margin: 0;
}

.featured-meta {
  margin: 0;
  color: #fff;
  font-size: 0.9rem;
  display:flex;
  gap:1rem;
}

.featured-genre {
  color: #0f172a;
  background: #fde047;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.featured-text p {
  margin: 0 0 0.8rem;
}

.featured-placeholder {
  text-align: center;
  color: #94a3b8;
  padding: 1rem;
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

  .featured-album {
    gap:0rem;
    padding: 2rem;
    margin:0;
    width:100%;
    text-align:center;
  }

  .featured-album > .section-header {
    flex-direction: column-reverse;
    gap:4rem;
  }

  .featured-album > .section-content {
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    margin:0;
    width:100%;
  }

  .featured-cover img {
    width: 80vw;
    max-width: 280px;
  }

  .featured-info {
    align-items: center;
  }

  .featured-meta {
    flex-direction: column;
    gap:0;
  }
}
</style>
