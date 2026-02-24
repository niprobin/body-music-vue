<template>
  <footer class="site-footer">
    <div class="footer-content">
      <!-- Instagram Link -->
      <a href="https://www.instagram.com/bodymusic_radio/"
         target="_blank"
         rel="noopener noreferrer"
         class="instagram-link"
         aria-label="Suivez-nous sur Instagram">
        <font-awesome-icon :icon="['fab', 'instagram']" class="instagram-icon" />
      </a>

      <p class="site-footline">Webradio 100% lyonnaise.
        <br>
        <span class="site-disclaimer">Ce site est la propriété de Body Music Radio.</span>
      </p>
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
  text-decoration:underline dotted;
}

.site-disclaimer {
  opacity: 0.7;
  font-size: 0.9rem;
}

.instagram-link {
  color: #e2e8f0;
  transition: color 0.2s ease;
  margin-bottom: 1rem;
}

.instagram-link:hover {
  color: #e1306c; /* Instagram brand color */
}

.instagram-icon {
  font-size: 2rem;
}
</style>
