<!-- filepath: src/components/Header.vue -->
<template>
  <header class="header" :class="{ scrolled }">
    <div class="logo">
      <!-- Replace with your logo image or SVG -->
      <router-link to="/">
        <img src="/body_music_letters_logo.png" alt="Logo" width="220" />
      </router-link>
    </div>
    <nav class="nav">
      <router-link to="/">Accueil</router-link>
      <router-link to="/schedule">Programmation</router-link>
      <router-link to="/last-songs">Dernières tracks</router-link>
      <router-link to="/albums">Nos albums</router-link>
    </nav>
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
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding:0 25px;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
  transition: border-bottom 0.2s;
  background: rgba(26, 41, 61, 0.9); /* Light glass effect */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.04);
}

.logo img {
  width: 150px;
}

.nav {
  max-width:100%;
  display: flex;
  gap: 1.5rem;
}

.nav a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-exact-active {
  border-bottom: 2px solid var(--secondary-color);
}

@media (max-width: 800px) {
  .header {
    position:relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .nav {
    display:none;
  }
}
</style>