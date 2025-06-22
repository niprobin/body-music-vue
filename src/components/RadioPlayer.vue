<template>
  <div class="radio-player-bar">
    <div class="radio-player-controls">
      <button class="player-btn" @click="togglePlay" :disabled="isLoading">
        <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
      </button>
      <span class="player-status">
        {{ statusText }}
      </span>
      <div class="volume-bar-container" @mousedown="startDrag" @touchstart.prevent="startDrag"
        @click="setVolume($event)" ref="volumeBar">
        <div class="volume-bar-bg">
          <div class="volume-bar-fill" :style="{ width: (volume * 100) + '%' }"></div>
        </div>
        <!-- Hidden native range for accessibility only -->
        <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="onVolumeInput" class="visually-hidden"
          aria-label="Volume" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Howl } from 'howler'

const streamUrl = 'https://radio.niprobin.com/listen/body_music_radio/body-radio-256'
const isPlaying = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const volume = ref(0.9)
let howl
const volumeBar = ref(null)
let dragging = false

const statusText = computed(() => {
  if (isError.value) return 'Erreur, rechargez la page'
  if (isLoading.value) return 'Chargement...'
  if (isPlaying.value) return 'Bonne écoute !'
  return 'écouter la radio'
})

function initHowler() {
  isLoading.value = true
  howl = new Howl({
    src: [streamUrl],
    html5: true,
    volume: volume.value,
    format: ['mp3'],
    onplay: () => {
      isPlaying.value = true
      isLoading.value = false
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: 'Body Music Radio',
          artist: 'Live',
          album: 'Body Music',
          artwork: [
            { src: '/browser_icon', sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          if (!isPlaying.value) {
            if (howl) {
              howl.unload();
              howl = null;
            }
            initHowler();
            howl.play();
          }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          if (isPlaying.value && howl) {
            howl.unload();
            howl = null;
            isPlaying.value = false;
            isLoading.value = false;
          }
        });
      }
    },
    onend: () => {
      isPlaying.value = false
    },
    onloaderror: () => {
      isError.value = true
      isLoading.value = false
      isPlaying.value = false
    },
    onplayerror: () => {
      isError.value = true
      isLoading.value = false
      isPlaying.value = false
    }
  })
}

function togglePlay() {
  if (isError.value) return
  if (!isPlaying.value) {
    // Always create a new Howl instance for each play
    if (howl) {
      howl.unload()
      howl = null
    }
    initHowler()
    howl.play()
  } else {
    // Stop: unload the stream
    if (howl) {
      howl.unload()
      howl = null
    }
    isPlaying.value = false
    isLoading.value = false
  }
}

function setVolume(event) {
  const bar = volumeBar.value
  const rect = bar.getBoundingClientRect()
  let x
  if (event.touches && event.touches.length) {
    x = event.touches[0].clientX - rect.left
  } else {
    x = event.clientX - rect.left
  }
  let newVolume = x / rect.width
  newVolume = Math.max(0, Math.min(1, newVolume))
  volume.value = newVolume
  if (howl) howl.volume(newVolume)
}

function onVolumeInput(e) {
  const newVolume = parseFloat(e.target.value)
  volume.value = newVolume
  if (howl) howl.volume(newVolume)
}

function startDrag(event) {
  dragging = true
  setVolume(event)
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

function onDrag(event) {
  if (!dragging) return
  setVolume(event)
}

function stopDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

onUnmounted(() => {
  if (howl) {
    howl.unload()
    howl = null
  }
  stopDrag()
})
</script>

<style scoped>
.radio-player-bar {
  width: 100%;
  background: rgba(72, 27, 42, 0.9);
  backdrop-filter: blur(2px);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 86px;
  max-height: 86px;
  min-height: 86px;
}

.radio-player-controls {
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
}

.player-btn {
  border-radius: 50%;
  color: #fff;
  background: transparent;
  border: none;
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  cursor: pointer;
}

.player-status {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  flex: 1 1 auto;
  margin-left: 1rem;
}

.volume-bar-container {
  width: 180px;
  height: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: auto;
  position: relative;
}

.volume-bar-bg {
  width: 100%;
  height: 8px;
  background: #222;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.volume-bar-fill {
  height: 100%;
  background: #fff;
  border-radius: 4px 0 0 4px;
}

.visually-hidden {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}


@media (max-width: 900px) {
  .radio-player-controls {
    width: 100%;
    padding: 5%;
    gap: 1rem;
  }

  .player-status {
    font-size: 1rem;
    margin-left: 0.5rem;
  }

  .volume-bar-container {
    width: 140px;
    height: 14px;
  }
}
</style>