<template>
  <header :class="['site-header', { 'site-header--scrolled': scrolled }]">
    <div class="header-inner">
      <router-link to="/" class="header-logo">
        <img src="/body_music_letters_logo.png" alt="Body Music Radio" />
      </router-link>
      <nav class="header-nav">
        <router-link to="/">Accueil</router-link>
        <router-link to="/schedule">Programmation</router-link>
        <router-link to="/last-songs">Dernières tracks</router-link>
        <router-link to="/albums">Nos albums</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.65);
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.site-header--scrolled {
  background: rgba(15, 23, 42, 0.9);
}

.header-inner {
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
  padding: 0.85rem clamp(0.75rem, 2.5vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.header-logo img {
  height: 40px;
  object-fit: contain;
}

.header-nav {
  display: flex;
  gap: 1rem;
}

.header-nav a {
  color: #f8fafc;
  text-decoration: none;
  font-weight: 500;
  position: relative;
  padding-bottom: 0.2rem;
}

.header-nav a.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: #f8fafc;
}

@media (max-width: 720px) {
  .header-inner {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-nav {
    display: none;
  }
}
</style>
