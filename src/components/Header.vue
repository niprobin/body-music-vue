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
      <router-link to="/last-songs">Trouver un son</router-link>
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
  /* border-bottom: 1px solid rgba(33, 54, 57, 0.756); */
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
  color: #fff;
  text-decoration: none;
  font-weight: 500;
}

.nav a.router-link-exact-active {
  border-bottom: 2px solid #fff;
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