<template>
  <button
    type="button"
    class="album-tile"
    :aria-label="label"
    aria-haspopup="dialog"
    @click="emit('open', $event.currentTarget)"
  >
    <img
      :src="coverUrl(album)"
      @error="useFallbackCover"
      :alt="''"
      class="album-tile__cover"
      loading="lazy"
    />
    <span class="album-tile__overlay">
      <span v-if="rating" class="album-tile__rating">
        <LucideIcon icon="star" :size="12" class="album-tile__star" />
        {{ rating }}/5
      </span>
      <span class="album-tile__title">{{ names.title || 'Titre inconnu' }}</span>
      <span v-if="names.artist" class="album-tile__artist">{{ names.artist }}</span>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import LucideIcon from './LucideIcon.vue'
import { coverUrl, useFallbackCover, albumNames } from '../lib/albums.js'

// A click opens the album sheet (bottom sheet on mobile, right drawer on desktop).
const props = defineProps({
  album: { type: Object, required: true }
})

const emit = defineEmits(['open'])

const names = computed(() => albumNames(props.album))
const rating = computed(() => Number(props.album.rating) || 0)

const label = computed(() => {
  const { title, artist } = names.value
  return [title || 'Titre inconnu', artist].filter(Boolean).join(' — ')
})
</script>

<style scoped>
.album-tile {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  text-align: left;
  text-decoration: none;
  font: inherit;
  cursor: pointer;
}

.album-tile:focus-visible {
  outline: 2px solid #f3efe8;
  outline-offset: 2px;
}

.album-tile__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-tile__overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.75) 55%, rgba(0, 0, 0, 0) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.album-tile:hover .album-tile__overlay,
.album-tile:focus-visible .album-tile__overlay {
  opacity: 1;
}

.album-tile__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
  color: #facc15;
  font-size: 12px;
  font-weight: 600;
}

.album-tile__star {
  fill: #facc15;
}

.album-tile__title,
.album-tile__artist {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-tile__title {
  font-weight: 600;
  font-size: 15px;
  color: #fff;
}

.album-tile__artist {
  font-weight: 400;
  font-size: 13px;
  color: #e2e8f0;
}

/* Mobile: text always visible, no rating line */
@media (max-width: 720px) {
  .album-tile__overlay {
    opacity: 1;
    padding: 22px 7px 6px;
  }

  .album-tile__rating {
    display: none;
  }

  .album-tile__title {
    font-size: 14px;
  }

  .album-tile__artist {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .album-tile__overlay {
    transition: none;
  }
}
</style>
