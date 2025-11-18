<template>
  <main>
    <section class="home">
      <div class="home-content">
        <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" />
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
      </div>
    </section>

    <section class="featured-placeholder" v-else>
      <p v-if="loadingFeatured">Chargement de l'album du moment…</p>
      <p v-else>Pas d'album du moment pour l'instant.</p>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const featuredAlbum = ref(null)
const loadingFeatured = ref(true)
const fallbackCover = 'https://music.niprobin.com/radio_cover.png'
const CACHE_KEY = 'featured_album_cache'
const CACHE_TIME_KEY = 'featured_album_cache_time'
const CACHE_TTL = 24 * 60 * 60 * 1000

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
    const cachedValue = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
    const cached = cachedValue ? JSON.parse(cachedValue) : null
    const isCacheValid = cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_TTL

    if (isCacheValid) {
      featuredAlbum.value = cached
    }

    const res = await fetch('https://opensheet.elk.sh/1LOx-C1USXeC92Mtv0u6NizEvcTMWkKJNGiNTwAtSj3E/3')
    const data = await res.json()
    if (Array.isArray(data) && data.length) {
      const nextAlbum = data[0]
      if (!cached || JSON.stringify(nextAlbum) !== JSON.stringify(cached)) {
        featuredAlbum.value = nextAlbum
        localStorage.setItem(CACHE_KEY, JSON.stringify(nextAlbum))
        localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
      }
    }
  } catch (_) {
    featuredAlbum.value = featuredAlbum.value || null
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
