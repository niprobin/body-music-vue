<template>
  <main class="chat-page">
    <h1>Chat</h1>
    <!-- Chirpy widget -->
    <div data-chirpy-theme="system" data-chirpy-comment="true" id="chirpy-comment"></div>
  </main>
</template>

<script setup>

</script>

<style scoped>

h3 {
  display:none;
}

.chat-page {
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  margin: 0 auto;
  padding: 100px 0px;
}

@media (max-width: 800px) {
  h1 {
    width: 100%;
    text-align: center;
  }

  .chat-page {
    width: 100%;
    padding: 0px 0px 92px 0px;
    margin: 0 auto;
  }
}
</style>