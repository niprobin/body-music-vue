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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  text-align: left;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.album-info {
    width: 100%;
}

.album-cover-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.album-rating-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background:linear-gradient(to right, #BF953F, #FCF6BA);
  color: #222;
  border-radius: 0.33rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 2;
}

.album-cover {
    width: 100%;
    border-radius: 0.5rem;
    object-fit: cover;
}

@media (max-width: 800px) {

    .albums-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        width:100%;
    }
    .album-card {
        flex-direction: row;
        justify-content: flex-start;
        
    }

    .album-cover-wrapper {
        width:250px;
    }

}
</style>