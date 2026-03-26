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
  scrolled.value = window.scrollY > 0.10
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
  z-index: 998;
  height:10vh;
  border-bottom:1px solid transparent;
}

.site-header--scrolled {
  height:10vh;
  background-color: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(6px);
  
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
  width:180px;
}

.header-logo img {
  width:100%;
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
  padding:6px 10px;
  border-radius:4px;
  
}

.header-nav a.router-link-active {
  background-color: #f3efe8;
  color:#111;
}

@media (max-width: 720px) {

  .header-inner {
    flex-direction: column;
    justify-content: center;
  }

  .header-nav {
    display: none;
  }
}
</style>
