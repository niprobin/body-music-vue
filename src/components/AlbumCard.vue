<template>
  <article class="album-card">
    <a v-if="link"
       :href="link"
       target="_blank"
       rel="noopener"
       class="album-cover-link">
      <img :src="album.cover_url || FALLBACK_COVER"
           :alt="album.release_name || 'Couverture album'"
           class="album-cover" />
    </a>
    <img v-else
         :src="album.cover_url || FALLBACK_COVER"
         :alt="album.release_name || 'Couverture album'"
         class="album-cover" />
    <div class="album-meta">
      <p class="album-name">{{ album.release_name || 'Titre inconnu' }}</p>
      <p class="album-date">Sortie le {{ formatSheetDate(album.release_date) }}</p>
      <StarRating v-if="rating" :rating="rating" size="medium" />
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import StarRating from './StarRating.vue'
import { FALLBACK_COVER, externalLink, formatSheetDate } from '../lib/albums.js'

const props = defineProps({
  album: { type: Object, required: true }
})

const link = computed(() => externalLink(props.album))
// The sheet sends ratings as strings ("4").
const rating = computed(() => Number(props.album.rating) || 0)
</script>

<style scoped>
.album-card {
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.album-cover-link {
  display: block;
  width: 100%;
}

.album-cover {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  height: auto;
  border-radius: 0.25rem;
  object-fit: cover;
  border: 1px solid rgba(51, 51, 51, 0.5);
  box-shadow: 2px 4px 4px 0px rgba(0, 0, 0, 0.25);
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
  width: 100%;
  padding-left: 4px;
  padding-top: 0.4rem;
}

.album-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.95rem;
}

.album-date {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
}
</style>
