<template>
  <footer class="site-footer">
    <div class="footer-content">
      <p class="site-footline">Webradio 100% lyonnaise.</p>
      <p class="site-disclaimer">Ce site est la propriété de Body Music Radio.</p>
      <nav class="site-plan" aria-label="Plan du site">
        <router-link to="/">Accueil</router-link>
        <router-link to="/schedule">Programmation</router-link>
        <router-link to="/albums">Albums</router-link>
        <router-link to="/last-songs">Dernières tracks</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
// no script
</script>

<style scoped>
.site-footer {
  background: #0a0a0a;
  color: #f8fafc;
  padding: 2.5rem 1rem calc(180px + 1rem);
  margin-top: 4rem;
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  align-items: center;
}

.site-plan {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.site-plan a {
  color: #e2e8f0;
  text-decoration: none;
}

.site-plan a:hover {
  text-decoration: underline;
}

.site-disclaimer {
  opacity: 0.7;
  font-size: 0.9rem;
}
</style>
