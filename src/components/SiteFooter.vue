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
// No script needed for static footer content
</script>

<style scoped>
.site-footer {
  width: 100%;
  margin:0 auto;
  color: #fff;
  display: flex;
  flex-direction:column;
}

.svg-wave-footer {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: transparent;
  position: relative;
  left: 0%;
  right: 50%;
}

.footer-content {
  background: #030507;
  width:100%;
  display:flex;
  flex-wrap: wrap;
  gap:10px;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  font-size: 0.95rem;
  padding-top:60px;
  padding-bottom:120px;
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

