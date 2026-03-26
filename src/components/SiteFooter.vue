<template>
  <footer class="site-footer">
    <div class="footer-content">
      <!-- Instagram Link -->
      <a href="https://www.instagram.com/bodymusic_radio/"
         target="_blank"
         rel="noopener noreferrer"
         class="instagram-link"
         aria-label="Suivez-nous sur Instagram">
        <svg class="instagram-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
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
  border-top:1px solid rgba(70, 69, 69, 0.95);
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
