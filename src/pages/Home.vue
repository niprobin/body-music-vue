<template>
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
  <section v-if="albumOfTheMoment" class="album-moment">
    <div class="album-moment-content">
      <div class="album-info">
        <h2>L'Album du moment</h2>
        <h3>{{ albumOfTheMoment.album }}</h3>
        <p><strong>Artiste:</strong> {{ albumOfTheMoment.artist }}</p>
        <p><strong>Genre:</strong> {{ albumOfTheMoment.genre }}</p>
        <div class="album-links">
          <a :href="albumOfTheMoment.spotify_url" target="_blank">Écouter sur Spotify</a>
          <a :href="albumOfTheMoment.buy_album" target="_blank">Acheter l'album</a>
        </div>
      </div>
      <div class="album-artwork">
        <img :src="albumOfTheMoment.cover_art" :alt="albumOfTheMoment.album" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const albumOfTheMoment = ref(null)

onMounted(async () => {
  const res = await fetch('https://opensheet.elk.sh/1gHxDBsWpkbOQ-exCD6iIC-uJS3JMjVmfFLvM8UO93qc/data_albums')
  const albums = await res.json()

  // Group by date-month
  const grouped = albums.reduce((acc, album) => {
    const month = album['date-month']
    if (!acc[month]) acc[month] = []
    acc[month].push(album)
    return acc
  }, {})

  // Find the most recent month
  const months = Object.keys(grouped)
  const latestMonth = months.sort((a, b) => {
    // Format: MM-YYYY
    const [ma, ya] = a.split('-').map(Number)
    const [mb, yb] = b.split('-').map(Number)
    return yb - ya || mb - ma
  })[0]

  // Get albums from latest month, pick highest rating
  const latestAlbums = grouped[latestMonth]
  const topAlbum = latestAlbums.reduce((best, album) =>
    Number(album.rating) > Number(best.rating) ? album : best, latestAlbums[0])

  albumOfTheMoment.value = topAlbum
})
</script>

<style scoped>

.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
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
  height:100%;
  padding-bottom:100px;
  border-bottom:1px solid #fff;
}

p {
  font-size: 1.1em;
}

.home-logo {
  width: 300px;
  margin-bottom: 1rem;
}

/* Album du moment CSS */
.album-moment {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom:100px;
}

.album-moment-content {
  text-align: left;
  width: 40vw;
  max-width: 1200px;
  min-width: 240px;
  font-weight: 300;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10%;
}

.album-info {
  flex: 1;
}

.album-artwork img {
  max-width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
}

.album-links a {
  margin-right: 1rem;
  color: #f16896;
  font-weight: bold;
}

@media (max-width: 800px) {
  .home-content,
  .album-moment-content {
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
  }

  .home-logo {
    width: 250px;
    margin: 1rem;
  }

  .home {
    min-height: 40vh;
  }

  .album-artwork img {
    max-width: 100%;
  }
}
</style>