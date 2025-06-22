<template>
  <section class="home">
    <div class="home-content">
      <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" />
      <section>
      <h1>Bienvenue sur Body Music Radio</h1>
      <p>
        Selecta réalisée par nos soins pour te faire danser &amp; chiller toute la journée&nbsp;! Tu aimes une track&nbsp;? Tu peux directement checker ce qui est entrain de jouer. Tu peux également regarder notre planning pour savoir à quoi t'attendre sur la radio.
      </p>
      </section>
    </div>
  </section>
</template>

<script setup>
// No script logic needed for now
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 1rem;
}

.home-content {
  text-align: left;
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  font-weight:300;
  display:flex;
  align-items: center;
  justify-content: center;
  gap:10%;
}

p {
  font-size: 1.1em;
}

.home-logo {
  width: 300px;
  margin-bottom: 1rem;
}

@media (max-width: 800px) {
  .home-content {
    flex-direction: column;
    gap: 2rem;
    width:100%;
    align-items: center;
    justify-content: flex-start;
    text-align:center;
  }
  .home-logo {
    width: 250px;
    margin: 1rem;
  }
  .home {
    min-height: 40vh;
  }
}
</style>