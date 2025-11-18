<template>
  <div id="app" class="app-shell">
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
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1 0 auto;
}
</style>
