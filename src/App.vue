<template>
  <div id="app">
    <Header />
    <main class="main-content">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
    </main>
    <RadioPlayer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import RadioPlayer from './components/RadioPlayer.vue'
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1 0 auto;
  padding-bottom: 70px; /* Add bottom padding to prevent content from being hidden behind the player */
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

</style>