<template>
  <div id="app" class="app-shell">
    <HeaderPlayer />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import HeaderPlayer from './components/HeaderPlayer.vue'
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
