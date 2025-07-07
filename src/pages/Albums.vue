<template>
    <main class="albums-page">
        <h1>Nos albums préférés</h1>
        <div class="albums-grid">
            <div v-for="album in albums" :key="album.id" class="album-card">
                <div class="album-cover-wrapper">
                    <img :src="album.cover_art || 'https://via.placeholder.com/150'" alt="cover" class="album-cover" />
                    <span v-if="album.rating" class="album-rating-badge">{{ album.rating }}</span>
                </div>
                <div class="album-info">
                    <h3>{{ album.album }}</h3>
                    <p>{{ album.artist }}</p>
                    <small>Sorti le {{ album.released_in }}</small>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const albums = ref([])

function formatDate(dateStr) {
    if (!dateStr) return ''
    // Expecting DD/MM/YYYY
    const [day, month, year] = dateStr.split('/')
    if (!day || !month || !year) return dateStr
    const d = new Date(`${year}-${month}-${day}`)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('fr-FR')
}

onMounted(async () => {
    const res = await fetch('https://opensheet.elk.sh/1gHxDBsWpkbOQ-exCD6iIC-uJS3JMjVmfFLvM8UO93qc/data_albums')
    let data = await res.json()
    data = data
        .filter(a => a.listened_in)
        .sort((a, b) => {
            // Parse DD/MM/YYYY to Date for both a and b
            const [da, ma, ya] = a.listened_in.split('/')
            const [db, mb, yb] = b.listened_in.split('/')
            const dateA = new Date(`${ya}-${ma}-${da}`)
            const dateB = new Date(`${yb}-${mb}-${db}`)
            return dateB - dateA // Most recent first
        })
    albums.value = data
})
</script>

<style scoped>
.albums-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 100px 16px 32px 16px;
}

.albums-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.album-card {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 0.75rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.album-info {
    width: 100%;
    max-width: 180px;
}

.album-cover-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.album-rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: gold;
  color: #222;
  border-radius: 50%;
  width: 2.2em;
  height: 2.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  border: 2px solid #fff;
  z-index: 2;
}

.album-cover {
    width: 100%;
    max-width: 180px;
    border-radius: 8px;
    margin-bottom: 1rem;
    object-fit: cover;
}

@media (max-width: 600px) {
    .albums-page {
        padding: 80px 4px 16px 4px;
    }

    .albums-grid {
        gap: 1rem;
    }
}
</style>