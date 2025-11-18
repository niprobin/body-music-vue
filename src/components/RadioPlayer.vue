<template>
  <div class="radio-player-bar section-card">
    <div class="player-stack">
      <div class="player-primary">
        <button class="player-btn" @click="togglePlay" :disabled="isLoading">
          <span class="btn-glow" />
          <span class="icon-wrapper">
            <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
          </span>
        </button>
        <div class="player-meta">
          <p class="player-title">Body Music Radio</p>
          <p class="player-status">{{ statusText }}</p>
        </div>
      </div>
      <div class="player-controls">
        <label class="volume-label" for="volume-range">Volume</label>
        <input id="volume-range" type="range" min="0" max="1" step="0.01" v-model="volume"
          @input="onVolumeInput" />
      </div>
      <div class="action-menu">
      <router-link to="/">
        <font-awesome-icon :icon="['fas', 'house']" />
        <span>Accueil</span>
      </router-link>
      <router-link to="/schedule">
        <font-awesome-icon :icon="['fas', 'calendar']" />
        <span>Prog</span>
      </router-link>
      <router-link to="/last-songs">
        <font-awesome-icon :icon="['fas', 'music']" />
        <span>Historique</span>
      </router-link>
    </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Howl } from 'howler'

const streamUrl = 'https://azuracast.niprobin.com/listen/body_music_radio/public.mp3'
const isPlaying = ref(false)
const isLoading = ref(false)
const isError = ref(false)
const volume = ref(0.85)
let howl

const statusText = computed(() => {
  if (isError.value) return 'Erreur, réessayez'
  if (isLoading.value) return 'Connexion au stream...'
  if (isPlaying.value) return 'Bonne écoute !'
  return 'Lancer la radio'
})

function initHowler() {
  isLoading.value = true
  isError.value = false
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
            { src: '/browser_icon.png', sizes: '512x512', type: 'image/png' }
          ]
        })

        navigator.mediaSession.setActionHandler('play', () => {
          if (!isPlaying.value) {
            if (howl) {
              howl.unload()
              howl = null
            }
            initHowler()
            howl.play()
          }
        })

        navigator.mediaSession.setActionHandler('pause', () => {
          if (isPlaying.value && howl) {
            howl.unload()
            howl = null
            isPlaying.value = false
            isLoading.value = false
            navigator.mediaSession.metadata = null
          }
        })
      }
    },
    onend: () => {
      isPlaying.value = false
    },
    onloaderror: () => handleStreamError(),
    onplayerror: () => handleStreamError()
  })
}

function handleStreamError() {
  isError.value = true
  isLoading.value = false
  isPlaying.value = false
}

function togglePlay() {
  if (isLoading.value) return
  if (!isPlaying.value) {
    if (howl) {
      howl.unload()
      howl = null
    }
    initHowler()
    howl.play()
  } else if (howl) {
    howl.unload()
    howl = null
    isPlaying.value = false
  }
}

function onVolumeInput(event) {
  const newVolume = parseFloat(event.target.value)
  volume.value = newVolume
  if (howl) {
    howl.volume(newVolume)
  }
}

onUnmounted(() => {
  if (howl) {
    howl.unload()
    howl = null
  }
})
</script>

<style scoped>
.radio-player-bar {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  width: min(960px, calc(100% - 32px));
  padding: 1.25rem 1.5rem;
  background: #0c0c0c;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 2rem;
  flex-direction: column;
  gap: 1rem;
  z-index: 3000;
box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
}

.player-stack {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.player-primary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-btn {
  width: 56px;
  height: 56px;
  border-radius: 56px;
  border: 1px solid #fff;
  background: #fff;
  color: #0c0c0c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.player-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-glow {
  display: none;
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}


.player-title {
  margin: 0;
  font-weight: 600;
}

.player-status {
  margin: 0;
  color: #cbd5f5;
  font-size: 0.9rem;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 180px;
}

.volume-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.player-controls input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: #eaeaea;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.5);
  cursor: pointer;
}

.player-controls input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #eaeaea;
  border: 2px solid #020617;
  box-shadow: 0 4px 10px rgba(8, 145, 178, 0.4);
  transition: transform 0.15s ease;
}

.player-controls input[type="range"]::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.player-controls input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #eaeaea;
  border: 1px solid #eaeaea;
  transition: transform 0.15s ease;
}

.player-controls input[type="range"]::-moz-range-progress {
  background: #eaeaea;
  border-radius:0px;
  height: 6px;
}

.player-controls input[type="range"]::-moz-range-track {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 999px;
  height: 6px;
}

@media (max-width: 720px) {
  .radio-player-bar {
    padding: 1rem;
    bottom: 16px;
    flex-direction: row;
    max-width: 90%;
    width:90%;
  }

  .player-stack {
    flex-direction: row;
    align-items: center;
    width:100%;
    gap:0;
  }

  .player-controls, .player-title, .player-status {
    display: none;
  }

  .action-menu {
    height: 56px;
    width: 80%;
    display: flex;
    gap: 0.2rem;
    justify-content: space-between;
  }

  .action-menu a {
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap:0.5rem;
    min-width: 33%;
    width: 33%;
    max-width: 33%;
    color: #fff;
    text-decoration: none;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
} 

@media (min-width: 721px) {
  .action-menu {
    display: none;
  }
}
</style>
