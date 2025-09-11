<template>
  <footer class="site-footer">
      <p class="site-footline">Webradio 100% lyonnaise.</p>
      <p class="site-disclaimer">Ce site est la propriété de Body Music Radio.</p>
      <nav class="site-plan" aria-label="Plan du site">
        <router-link to="/">Accueil</router-link>
        <router-link to="/schedule">Programmation</router-link>
        <router-link to="/albums">Albums</router-link>
        <router-link to="/last-songs">Dernières tracks</router-link>
      </nav>
    </footer>
</template>

<script setup>
// No script needed for static footer content
</script>

<style scoped>
.site-footer {
  width: 50vw;
  max-width: 1200px;
  min-width: 240px;
  margin:0 auto;
  padding-bottom:120px;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: column;
  font-size: 0.95rem;
}

.site-footline {
  margin: 0;
  font-weight: 600;
}

.site-plan {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.site-plan span {
  opacity: 0.8;
  margin-right: 4px;
}

.site-plan a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted rgba(255, 255, 255, 0.4);
}

.site-plan a:hover {
  border-bottom-style: solid;
}

.site-disclaimer {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

@media (max-width: 700px) {
  .site-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

