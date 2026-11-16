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
    <MobileTabBar />
  </div>
</template>

<script setup>
import HeaderPlayer from './components/HeaderPlayer.vue'
import Footer from './components/SiteFooter.vue'
import MobileTabBar from './components/MobileTabBar.vue'
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

/* Keep the fixed bottom tab bar from hiding the footer / last content */
@media (max-width: 720px) {
  .app-shell {
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }
}
</style>
