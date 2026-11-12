<template>
  <Teleport to="body">
    <div class="album-sheet-root" :class="{ 'is-open': open }" :inert="!open || undefined">
      <div class="album-sheet__backdrop" @click="close" />
      <div
        ref="sheetEl"
        class="album-sheet"
        :class="{ 'album-sheet--tinted': palette }"
        :style="palette"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <div class="album-sheet__handle" aria-hidden="true" />
        <template v-if="shown">
          <div class="album-sheet__head">
            <img
              :key="coverUrl(shown)"
              :src="coverUrl(shown)"
              @error="useFallbackCover"
              alt=""
              class="album-sheet__cover"
            />
            <div class="album-sheet__info">
              <h2 :id="titleId" class="album-sheet__title">{{ names.title || 'Titre inconnu' }}</h2>
              <p v-if="names.artist" class="album-sheet__artist">{{ names.artist }}</p>
              <p v-if="rating" class="album-sheet__rating">
                <LucideIcon icon="star" :size="14" class="album-sheet__star" />
                {{ rating }}/5
              </p>
              <p class="album-sheet__date">Sortie le {{ formatSheetDate(shown.release_date) }}</p>
            </div>
          </div>
          <div class="album-sheet__actions">
            <a
              v-if="link"
              :href="link"
              target="_blank"
              rel="noopener"
              class="album-sheet__btn album-sheet__btn--primary"
            >{{ linkLabel }}</a>
            <button
              ref="closeBtn"
              type="button"
              class="album-sheet__btn"
              @click="close"
            >Fermer</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import LucideIcon from './LucideIcon.vue'
import { coverUrl, useFallbackCover, externalLink, formatSheetDate, albumNames } from '../lib/albums.js'
import { readCoverColor, sheetPalette } from '../lib/coverColor.js'

const props = defineProps({
  // The album to show; null closes the sheet.
  album: { type: Object, default: null },
  // Element to give focus back to on close (the tapped tile).
  returnFocus: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const titleId = 'album-sheet-title'
const sheetEl = ref(null)
const closeBtn = ref(null)
const open = computed(() => !!props.album)

// Keep the last album rendered while the sheet slides out.
const shown = ref(null)
const names = computed(() => albumNames(shown.value))
const rating = computed(() => Number(shown.value?.rating) || 0)
const link = computed(() => externalLink(shown.value))
const linkLabel = computed(() => {
  if (link.value.includes('discogs.com')) return 'Voir sur Discogs'
  if (link.value.includes('deezer.com')) return 'Écouter sur Deezer'
  return 'Écouter sur Spotify'
})

// Background = the cover's dominant colour, text = black or white.
// Until it's read (or if it can't be), the default dark theme shows.
const palette = ref(null)

watch(shown, async (album) => {
  palette.value = null
  if (!album) return
  const color = await readCoverColor(coverUrl(album))
  if (shown.value === album && color) palette.value = sheetPalette(color)
})

let saved = null

// Hiding the scrollbar would shift the page sideways on desktop, so its
// width is put back as padding while the sheet is open.
function lockScroll(lock) {
  const body = document.body
  if (lock) {
    saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    body.style.overflow = 'hidden'
  } else if (saved) {
    body.style.overflow = saved.overflow
    body.style.paddingRight = saved.paddingRight
    saved = null
  }
}

watch(() => props.album, async (album, previous) => {
  if (album) {
    shown.value = album
    if (!previous) lockScroll(true)
    await nextTick()
    ;(closeBtn.value || sheetEl.value)?.focus({ preventScroll: true })
  } else if (previous) {
    lockScroll(false)
    props.returnFocus?.focus?.({ preventScroll: true })
  }
})

onBeforeUnmount(() => {
  if (open.value) lockScroll(false)
})

function close() {
  emit('close')
}

// Escape closes; Tab stays inside the sheet.
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab') return
  const focusables = [...sheetEl.value.querySelectorAll('a[href], button')]
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<style scoped>
.album-sheet-root {
  position: fixed;
  inset: 0;
  /* Above the sticky header player and mobile nav (998) */
  z-index: 1000;
  pointer-events: none;
}

.album-sheet-root.is-open {
  pointer-events: auto;
}

.album-sheet__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.is-open .album-sheet__backdrop {
  opacity: 1;
}

.album-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 85vh;
  overflow-y: auto;
  padding: 12px 20px calc(32px + env(safe-area-inset-bottom));
  background: #1b2c3d;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0;
  color: #f3efe8;
  transform: translateY(110%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.is-open .album-sheet {
  transform: translateY(0);
}

.album-sheet:focus {
  outline: none;
}

.album-sheet__handle {
  width: 40px;
  height: 4px;
  margin: 0 auto 16px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.5);
}

.album-sheet__head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.album-sheet__cover {
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  border-radius: 4px;
  object-fit: cover;
}

.album-sheet__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.album-sheet__title {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  text-transform: none;
  color: #fff;
}

.album-sheet__artist {
  margin: 0;
  font-size: 14px;
  color: #cbd5e1;
}

.album-sheet__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 2px 0 0;
  color: #facc15;
  font-size: 14px;
  font-weight: 600;
}

.album-sheet__star {
  fill: #facc15;
}

.album-sheet__date {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.album-sheet__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.album-sheet__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: transparent;
  color: #f3efe8;
  font: inherit;
  font-size: 15px;
  text-decoration: none;
  cursor: pointer;
}

.album-sheet__btn--primary {
  border-color: #f3efe8;
  background: #f3efe8;
  color: #111;
  font-weight: 600;
}

.album-sheet__btn:focus-visible {
  outline: 2px solid #facc15;
  outline-offset: 2px;
}

/* Tinted with the cover colour: every colour follows --sheet-fg */
.album-sheet {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), background-color 0.3s ease;
}

.album-sheet--tinted {
  background: var(--sheet-bg);
  color: var(--sheet-fg);
  border-color: rgba(var(--sheet-fg-rgb), 0.2);
}

.album-sheet--tinted .album-sheet__handle {
  background: rgba(var(--sheet-fg-rgb), 0.4);
}

.album-sheet--tinted .album-sheet__title {
  color: var(--sheet-fg);
}

/* Full text colour: an alpha would drop mid-tone covers under 4.5:1 */
.album-sheet--tinted .album-sheet__artist,
.album-sheet--tinted .album-sheet__date {
  color: var(--sheet-fg);
}

.album-sheet--tinted .album-sheet__rating {
  color: var(--sheet-fg);
}

.album-sheet--tinted .album-sheet__star {
  color: var(--sheet-star);
  fill: var(--sheet-star);
}

.album-sheet--tinted .album-sheet__btn {
  border-color: rgba(var(--sheet-fg-rgb), 0.45);
  color: var(--sheet-fg);
}

.album-sheet--tinted .album-sheet__btn--primary {
  border-color: var(--sheet-fg);
  background: var(--sheet-fg);
  color: var(--sheet-bg);
}

.album-sheet--tinted .album-sheet__btn:focus-visible {
  outline-color: var(--sheet-fg);
}

/* Desktop: a drawer sliding in from the right */
@media (min-width: 721px) {
  .album-sheet {
    top: 0;
    left: auto;
    width: min(400px, 100%);
    max-height: none;
    padding: 32px 28px;
    border-top: 0;
    border-left: 1px solid rgba(148, 163, 184, 0.25);
    transform: translateX(110%);
  }

  .is-open .album-sheet {
    transform: translateX(0);
  }

  .album-sheet__handle {
    display: none;
  }

  .album-sheet__head {
    flex-direction: column;
    gap: 20px;
  }

  .album-sheet__cover {
    flex: none;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .album-sheet__title {
    font-size: 22px;
  }

  .album-sheet__artist {
    font-size: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .album-sheet,
  .album-sheet--tinted,
  .album-sheet__backdrop {
    transition: none;
  }
}
</style>
