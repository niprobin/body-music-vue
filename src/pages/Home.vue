<template>
  <main>
    <section class="home">
      <div class="home-content">
        <div class="home-text">
          <h1>Bienvenue sur Body Music Radio</h1>
          <p>
            Selecta réalisée par nos soins pour te faire danser &amp; chiller toute la journée&nbsp;! Tu aimes une
            track&nbsp;? Tu peux directement checker ce qui est entrain de jouer.<br><br>Tu peux également regarder notre
            planning pour savoir à quoi t'attendre sur la radio.
          </p>
        </div>
        <img src="/body_music_duck_logo.png" alt="Body Music Radio Logo" class="home-logo" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.home-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 960px;
  width: 100%;
}

.home-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.home-logo {
  width: 220px;
  max-width: 40%;
}

@media (max-width: 700px) {
  .home-content {
    flex-direction: column;
    text-align: center;
  }

  .home-text {
    text-align: center;
  }

  .home-logo {
    max-width: 60%;
  }
}
</style>
