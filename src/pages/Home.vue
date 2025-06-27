<template>
  <main>
    <section class="home">
      <div class="home-content">
        <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" />
        <section>
          <h1>Bienvenue sur Body Music Radio</h1>
          <p>
            Selecta réalisée par nos soins pour te faire danser &amp; chiller toute la journée&nbsp;! Tu aimes une
            track&nbsp;? Tu peux directement checker ce qui est entrain de jouer. Tu peux également regarder notre
            planning pour savoir à quoi t'attendre sur la radio.
          </p>
        </section>
      </div>
    </section>
    <div class="svg-wave">
      <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        style="display:block; width:100%; height:80px;">
        <path fill="#d5c4b1"
          d="M0,192 C120,160 280,200 400,160 C520,120 680,200 800,180 C920,160 1080,120 1200,160 C1320,200 1440,160 1440,160 L1440,320 L0,320 Z" />
      </svg>
    </div>
    <section v-if="albumOfTheMoment" class="album-moment">
      <div class="album-moment-content">
        <div class="album-info">
          <h2>L'album du moment</h2>
          <h3>{{ albumOfTheMoment.album }}</h3>
          <p><strong>Artiste:</strong> {{ albumOfTheMoment.artist }}</p>
          <p><strong>Genre:</strong> {{ albumOfTheMoment.genre }}</p>
          <div class="album-links">
            <a :href="albumOfTheMoment.spotify_url" target="_blank">Spotify</a>
            <a :href="albumOfTheMoment.buy_album" target="_blank">Acheter</a>
          </div>
          <p>Supporte les artistes que tu aimes en achetant leurs albums et en allant les voir en concert ! Nous n'avons
            aucune affiliation avec les liens Bandcamp que tu trouveras sur le site. Le plaisir de partager avant
            tout.<br><br>
            <a class="ext-link" target="_blank" href="https://body-music.netlify.app/albums">Tous nos albums préférés
              ici.&nbsp;<font-awesome-icon :icon="['fas', 'link']" /></a>
          </p>

        </div>
        <div class="album-artwork">
          <a :href="albumOfTheMoment.spotify_url" target="_blank"><img :src="albumOfTheMoment.cover_art"
              :alt="albumOfTheMoment.album" /></a>
        </div>
      </div>
    </section>
    <div class="svg-wave reverse">
      <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
        style="display:block; width:100%; height:80px;">
        <path fill="#d5c4b1"
          d="M0,192 C120,160 280,200 400,160 C520,120 680,200 800,180 C920,160 1080,120 1200,160 C1320,200 1440,160 1440,160 L1440,320 L0,320 Z" />
      </svg>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const albumOfTheMoment = ref(null)
const CACHE_KEY = 'albumOfTheMoment'
const CACHE_TIME_KEY = 'albumOfTheMoment_time'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in ms

async function fetchAlbum() {
  const res = await fetch('https://opensheet.elk.sh/1gHxDBsWpkbOQ-exCD6iIC-uJS3JMjVmfFLvM8UO93qc/data_albums')
  const albums = await res.json()
  if (albums && albums.length > 0) {
    return albums[0] // Pick the first entry
  }
  return null
}

onMounted(async () => {
  const cached = localStorage.getItem(CACHE_KEY)
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
  const now = Date.now()

  if (cached && cachedTime && now - Number(cachedTime) < CACHE_DURATION) {
    albumOfTheMoment.value = JSON.parse(cached)
  } else {
    const album = await fetchAlbum()
    if (album) {
      albumOfTheMoment.value = album
      localStorage.setItem(CACHE_KEY, JSON.stringify(album))
      localStorage.setItem(CACHE_TIME_KEY, now.toString())
    }
  }
})
</script>

<style scoped>
main {
  padding: 150px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.home {
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-content {
  text-align: left;
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10%;
  padding: 50px;
  background-color: var(--primary-color);
  color: var(--secondary-color);
  text-align: left;
  border-radius: 0.75rem;
}

.home-logo {
  width: 300px;
  margin-bottom: 1rem;
}

/* SVG Wave */

.svg-wave {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: #1a293d;
  position: relative;
  left: 0%;
  right: 50%;
}

.reverse {
  transform: scaleY(-1);
}

/* Album du moment CSS */
.album-moment {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--secondary-color);
  padding:2%;
}

.album-moment-content {
  text-align: left;
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  padding: 50px;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  text-align: left;
  border-radius: 0.75rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10%;
}

.album-info {
  flex: 1;
}

.album-artwork img {
  max-width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.album-links {
  margin: 30px auto;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}

.album-links a {
  color: #fff;
  text-decoration: none;
  background-color: var(--primary-color);
  width: 50%;
  padding: 15px 0px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
  text-align: center;
}

.ext-link {
  color: var(--primary-color);
  background-color: var(--secondary-color);
  padding: 2px 4px;
}

@media (max-width: 800px) {

  main {
    padding: 0px 0px 40px 0px;
  }

  .home-content,
  .album-moment-content {
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }

  .album-moment-content {
    flex-direction: column-reverse;
  }

  .home-logo {
    width: 250px;
    margin: 1rem;
  }

  .album-artwork img {
    max-width: 60%;
    margin-bottom:30px;
  }
}
</style>