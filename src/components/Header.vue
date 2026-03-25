<template>
  <header :class="['site-header', { 'site-header--scrolled': scrolled }]">
    <div class="header-inner">
      <router-link to="/" class="header-logo">
        <img src="/body-music-gradient.png" alt="Body Music Radio" />
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
  scrolled.value = window.scrollY > window.innerHeight * 0.25
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
  height:10vh;
}

.site-header--scrolled {
  background: rgba(15, 23, 42, 1);
  border-bottom:1px solid #0f2236;
}

.header-inner {
  width: 100%;
  height:100%;
  max-width: 95vw;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.header-logo {
  display:flex;
  justify-content: center;
  align-items: center;
}

.header-logo img {
  width:256px;
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
