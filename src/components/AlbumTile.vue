<template>
  <component
    :is="tag"
    class="album-tile"
    v-bind="tagAttrs"
    @click="onClick"
  >
    <img
      :src="album.cover_url || FALLBACK_COVER"
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
  </component>
</template>

<script setup>
import { computed } from 'vue'
import LucideIcon from './LucideIcon.vue'
import { FALLBACK_COVER, externalLink, splitReleaseName } from '../lib/albums.js'

const props = defineProps({
  album: { type: Object, required: true },
  // On mobile a tap opens the bottom sheet instead of the external link.
  mobile: { type: Boolean, default: false }
})

const emit = defineEmits(['open'])

const link = computed(() => externalLink(props.album))
const names = computed(() => splitReleaseName(props.album.release_name))
const rating = computed(() => Number(props.album.rating) || 0)

const label = computed(() => {
  const { title, artist } = names.value
  return [title || 'Titre inconnu', artist].filter(Boolean).join(' — ')
})

// A link when there is somewhere to go, a button when the tap opens the
// sheet, otherwise a focusable block so the overlay still shows on focus.
const tag = computed(() => {
  if (props.mobile) return 'button'
  return link.value ? 'a' : 'div'
})

const tagAttrs = computed(() => {
  if (tag.value === 'button') return { type: 'button', 'aria-label': label.value, 'aria-haspopup': 'dialog' }
  if (tag.value === 'a') return { href: link.value, target: '_blank', rel: 'noopener', 'aria-label': label.value }
  return { tabindex: 0, 'aria-label': label.value }
})

function onClick(event) {
  if (props.mobile) emit('open', event.currentTarget)
}
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

div.album-tile {
  cursor: default;
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
