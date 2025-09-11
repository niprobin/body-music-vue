<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <RadioPlayer />
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import RadioPlayer from './components/RadioPlayer.vue'
import Footer from './components/SiteFooter.vue'
</script>

<style>
#app {
  width: 100%;
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  text-align: left;
  box-sizing: border-box;
}

.main-content {
  flex: 1 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>