<!-- filepath: src/components/Header.vue -->
<template>
  <header class="header">
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
// No script logic needed for now
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2%;
  color: #fff;
}

.logo img {
  width: 150px;
}

.nav {
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

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4vw 2vw;
    gap: 1rem;
  }

  .nav {
    gap: 1rem;
    flex-wrap: wrap;
  }
}
</style>