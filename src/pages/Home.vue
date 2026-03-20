<template>
  <main v-if="!loadingFeatured">
    <section class="home">
      <div class="home-content">
        <!-- <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" /> -->
        <div class="home-text">
          <h1>Bienvenue sur Body Music Radio</h1>
          <p>
            Selecta réalisée par nos soins pour te faire danser &amp; chiller toute la journée&nbsp;! Tu aimes une
            track&nbsp;? Tu peux directement checker ce qui est entrain de jouer.<br><br>Tu peux également regarder notre
            planning pour savoir à quoi t'attendre sur la radio.
          </p>
        </div>
      </div>
    </section>

    <section class="featured-album" v-if="featuredAlbum">
        <div class="featured-cover">
          <img :src="featuredAlbum.cover_url || fallbackCover" :alt="featuredAlbum.release_name || 'Album du moment'" />
      </div>
      <div class="featured-info">
        <p class="featured-label">Album du moment</p>
        <h2>{{ featuredAlbum.release_name }}</h2>
        <p class="featured-meta">
          Sortie le {{ formatReleaseDate(featuredAlbum.release_date) }}
        </p>
        <span class="featured-genre">{{ featuredAlbum.genre || 'Genre inconnu' }}</span>
        <div class="featured-text">
          <p v-for="(paragraph, idx) in formattedText" :key="idx">
            {{ paragraph }}
          </p>
        </div>
        <router-link to="/albums">
          <button class="more-albums">Découvrir plus d'albums</button>
        </router-link>
      </div>
    </section>

    <section class="featured-placeholder" v-else>
      <p v-if="loadingFeatured">Chargement en cours…</p>
      <p v-else>Pas d'album du moment pour l'instant.</p>
    </section>
  </main>
  <section class="home-loading" v-else>
    <p>Chargement en cours…</p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const featuredAlbum = ref(null)
const loadingFeatured = ref(true)
const fallbackCover = 'https://music.niprobin.com/radio_cover.png'

function formatReleaseDate(value) {
  if (!value) return 'Date inconnue'
  const [day, month, year] = String(value).split('-')
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(dateObj.getTime())) return value
  return dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

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
.home {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.home-content {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 960px;
  width: 100%;
}

.home-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.home-logo {
  width: 220px;
  max-width: 40%;
}

.featured-album {
  display: flex;
  gap: 2rem;
  align-items: center;
  max-width: 960px;
  margin: 0 auto 2rem;
  padding: 2rem 1rem;
  background: #0b101d;
  border-radius: 1.2rem;
}

.featured-cover img {
  width: 260px;
  max-width: 40vw;
  border-radius: 1rem;
  object-fit: cover;
  box-shadow: rgba(3, 7, 18, 0.45) 0px 20px 45px;
}

.featured-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.featured-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.featured-info h2 {
  margin: 0;
}

.featured-meta {
  margin: 0;
  color: #fff;
  font-size: 0.9rem;
}

.featured-genre {
  display: inline;
  color: #0f172a;
  background: #fde047;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 0.4rem;
  align-self: flex-start;
}

.featured-text p {
  margin: 0 0 0.8rem;
}

.featured-placeholder {
  text-align: center;
  color: #94a3b8;
  padding: 1rem;
}

.home-loading {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 1rem;
}

.more-albums {
  background-color: #f8f9fa;
  border: 1px solid #f8f9fa;
  border-radius: 4px;
  color: #3c4043;
  cursor: pointer;
  font-family: arial,sans-serif;
  font-size: 14px;
  height: 36px;
  line-height: 27px;
  min-width: 54px;
  padding: 0 16px;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: pre;
}

@media (max-width: 700px) {
  .home-content {
    flex-direction: column;
    text-align: center;
  }

  .home-text {
    text-align: center;
  }

  .home-logo {
    max-width: 60%;
  }

  .featured-album {
    flex-direction: column;
    text-align: center;
  }

  .featured-cover img {
    width: 60vw;
    max-width: 280px;
  }

  .featured-info {
    align-items: center;
  }

  .featured-text p {
    text-align: left;
  }
}
</style>
