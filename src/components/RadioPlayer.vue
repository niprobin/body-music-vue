<template>
  <div class="radio-player-bar">
    <div class="radio-player-controls">
      <div :class="['player-btn-wrapper', { 'breathe-animate': isPlaying }]">
        <button class="player-btn" @click="togglePlay" :disabled="isLoading">
          <span class="icon-wrapper">
            <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
          </span>
        </button>
      </div>
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
    <div class="action-menu">
      <router-link to="/"><font-awesome-icon :icon="['fas', 'house']" /><br><span
          class="label">Accueil</span></router-link>
      <router-link to="/schedule"><font-awesome-icon :icon="['fas', 'calendar']" /><br><span
          class="label">Programme</span></router-link>
      <router-link to="/last-songs"><font-awesome-icon :icon="['fas', 'music']" /><br><span
          class="label">Historique</span></router-link>
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
            // Optionally clear Media Session metadata if you want to remove the notification immediately:
            if ('mediaSession' in navigator) {
              navigator.mediaSession.metadata = null;
            }
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
  width: 90%;
  background: rgba(14, 13, 13, 0.98);
  box-shadow: rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;
  backdrop-filter: blur(2px);
  border-radius: 50px;
  border: 1px solid #46464642;
  color: #fff;
  position: fixed;
  left: 5%;
  bottom: 2.5%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 86px;
  max-height: 86px;
  min-height: 86px;
  padding: 1.5rem;
}

.radio-player-controls {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.player-btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-btn {
  position: relative;
  color: #0c0c0c;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.player-btn .icon-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

}

/* The wave effect */
.player-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url('/wavey-play-bg.svg') repeat-x;
  background-size: 160px 100%;
  opacity: 0.4;
  pointer-events: none;
  z-index: 1;
  display: none;
}

.breathe-animate .player-btn::before {
  display: block;
  animation: wave-move-btn 4s linear infinite;
}

@keyframes wave-move-btn {
  0% {
    background-position-x: 0;
  }

  100% {
    background-position-x: -160px;
  }
}

@keyframes wave-move-btn-reverse {
  0% {
    background-position-x: -160px;
  }

  100% {
    background-position-x: 0;
  }
}

@keyframes wave-swell-btn {

  0%,
  100% {
    background-position-y: 0;
  }

  50% {
    background-position-y: 10px;
  }
}


/* --------- End Sound wave effect ----*/

.player-btn:active {
  transform: scale(0.95);
  box-shadow: inset 6px 6px 29px 3px rgba(0, 0, 0, 0.1);

}

.player-status {
  font-size: 1rem;
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

.action-menu {
  display: none;
}

@media (min-width: 801px) {

  .radio-player-bar {
    width: 50%;
    max-width: 50%;
    min-width: 50%;
    left: 25%;
  }

}


@media (max-width: 800px) {

  .radio-player-bar {
    padding: 1.5rem;
    justify-content: space-between;
  }

  .radio-player-controls {
    width: 20%;
    min-width: 20%;
    max-width: 20%;
  }

  .player-status {
    margin-left: 0.5rem;
    display: none;
  }

  .volume-bar-container {
    display: none;
  }

  .action-menu {
    display: flex;
    width: 80%;
    justify-content: flex-end;
    align-items: center;
    color: #fff;
  }

  .action-menu a {
    min-width: 33%;
    width: 33%;
    max-width: 33%;
    color: #fff;
    text-decoration: none;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
    /* Removes blue highlight on iOS/Android */
    outline: none;
    /* Removes focus outline */
  }

  .action-menu .label {
    font-size: 0.7rem;
    text-transform: uppercase;
  }

}
</style>