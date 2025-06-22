<template>
  <div class="radio-player-bar">
    <button @click="togglePlay">
      <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
    </button>
    <span class="status" v-if="error">Erreur avec le stream</span>
    <span class="status" v-else-if="loading">Chargement...</span>
    <span class="status" v-else>En direct</span>
    <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="setVolume" aria-label="Volume" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Howl } from 'howler'

const streamUrl = 'https://radio.niprobin.com/listen/body_music_radio/body-radio-256'
const isPlaying = ref(false)
const loading = ref(false)
const error = ref(false)
const volume = ref(1)
let howl

function initHowler() {
  howl = new Howl({
    src: [streamUrl],
    html5: true,
    volume: volume.value,
    format: ['mp3'],
    onplay: () => {
      isPlaying.value = true
      loading.value = false
      error.value = false
    },
    onload: () => {
      loading.value = false
    },
    onloaderror: () => {
      error.value = true
      loading.value = false
    },
    onplayerror: () => {
      error.value = true
      loading.value = false
    },
    onend: () => {
      isPlaying.value = false
    }
  })
}

function togglePlay() {
  if (!howl) {
    loading.value = true
    initHowler()
    howl.play()
  } else if (isPlaying.value) {
    howl.pause()
    isPlaying.value = false
  } else {
    howl.play()
    loading.value = true
  }
}

function setVolume() {
  if (howl) howl.volume(volume.value)
}

onMounted(() => {
  // Optionally, auto-play on mount
  // togglePlay()
})

onUnmounted(() => {
  if (howl) {
    howl.unload()
    howl = null
  }
})

watch(volume, setVolume)
</script>

<style scoped>
.radio-player-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color:rgba(238, 133, 168, 0.22);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
  backdrop-filter: blur(8px);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-radius: 1.5rem 1.5rem 0 0;
  margin: 0 auto;
  left: 0;
  right: 0;
}

button {
  border: none;
  background-color:transparent;
  color: #fff;
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  cursor: pointer;
}
button:active {
  transform: scale(0.96);
}

.status {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  margin-left: 0.5rem;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px #0008;
}

input[type="range"] {
  appearance:none;
  -webkit-appearance: none;
  width: 220px;
  height: 8px;
  background: transparent;
  margin-left: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(48, 48, 48, 0.12);
  position: relative;
  overflow: hidden;
  cursor:pointer;
}

/* Track: white with shadow */
input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  background:rgba(109, 109, 108, 0.5);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(48, 48, 48, 0.12);
}

/* Filled bar: accent color */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 8px;
  box-shadow: -140px 0 0 140px #fff; /* Fills the bar up to the thumb */
  background: transparent;
  cursor: pointer;
  border: none;
  margin-top: 0;
}

input[type="range"]:focus {
  outline: none;
}

/* Firefox */
input[type="range"]::-moz-range-track {
  height: 8px;
  background:rgba(109, 109, 108, 0.5);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(48, 48, 48, 0.12);
}
input[type="range"]::-moz-range-progress {
  height: 8px;
  background: #fff;
  border-radius: 4px;
}
input[type="range"]::-moz-range-thumb {
  width: 0;
  height: 8px;
  border: none;
  background: transparent;
}

input[type="range"]::-ms-fill-lower {
  background: #fff;
  border-radius: 4px;
}
input[type="range"]::-ms-fill-upper {
  background:rgba(109, 109, 108, 0.5);
  border-radius: 4px;
}
input[type="range"]::-ms-thumb {
  width: 0;
  height: 8px;
  border: none;
  background: transparent;
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: none;
}

input[type="range"]::-webkit-slider-thumb:active {
  box-shadow: none;
}

input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: none;
}

/* Hide the thumb for all browsers */
input[type="range"]::-webkit-slider-thumb,
input[type="range"]::-moz-range-thumb,
input[type="range"]::-ms-thumb {
  opacity: 0;
}

input[type="range"]::-ms-tooltip {
  display: none;
}

/* Remove outline on focus for all browsers */
input[type="range"]:focus {
  outline: none;
}

@media (max-width: 600px) {
  .radio-player-bar {
    max-width: 98vw;
    padding: 0.5rem 0.5rem;
    border-radius: 1rem 1rem 0 0;
    gap: 1rem;
  }
  input[type="range"] {
    width: 90px;
  }
  button {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>