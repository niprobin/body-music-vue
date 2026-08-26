<template>
  <section class="last-songs">
    <div class="last-songs__header">
      <h1>Dernières tracks jouées</h1>
      <p>Tu aimes le dernier son que t'as entendu ? Tu le trouves ici fastoche.</p>
    </div>

    <div class="history-list">
      <template v-if="isLoading && !hasLoadedOnce">
        <div v-for="n in 5" :key="n" class="history-item history-item--skeleton">
          <div class="history-meta">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="skeleton-line skeleton-line--artist"></div>
          </div>
        </div>
      </template>

      <p v-else-if="tracks.length === 0" class="history-empty">
        Historique en cours de constitution
      </p>

      <template v-else>
        <div
          v-for="(entry, index) in tracks"
          :key="`${entry.artist}-${entry.title}-${entry.fullDate}-${index}`"
          :class="['history-item', { 'history-item--placeholder': isPlaceholder(entry) }]"
        >
          <div class="history-meta">
            <div class="history-row">
              <p class="history-title">{{ entry.title || 'Titre inconnu' }}</p>
              <span class="history-time">{{ entry.fullDate }}</span>
            </div>
            <p class="history-artist">{{ entry.artist || 'Artiste inconnu' }}</p>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { useHistory } from '../composables/useHistory.js'

const { tracks, isLoading, hasLoadedOnce } = useHistory()

function isPlaceholder(entry) {
  return entry.artist === 'Body Music Radio' && entry.title === 'Nouveauté'
}
</script>

<style scoped>
.last-songs {
  max-width: 100%;
  margin: 2rem auto;
  padding: 0rem 6rem;
  padding-bottom: 5vh;
}

.last-songs__header {
  margin-bottom: 1.5rem;
}

.last-songs__header p {
  margin: 0.2rem 0 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(70, 69, 69, 0.95);
  border-radius: 16px;
  overflow: hidden;
}

.history-item {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(70, 69, 69, 0.95);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item--placeholder .history-title,
.history-item--placeholder .history-artist {
  color: rgba(243, 239, 232, 0.55);
  font-style: italic;
}

.history-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.history-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.history-row span {
  flex-shrink: 0;
}

.history-title {
  margin: 0;
  font-weight: 600;
  color: #f3efe8;
}

.history-artist {
  margin: 0;
  color: #fff;
  font-size: 0.95rem;
}

.history-time {
  font-size: 0.85rem;
  color: #f3efe8;
}

.history-empty {
  padding: 1.5rem 1.2rem;
  margin: 0;
  color: rgba(243, 239, 232, 0.7);
  text-align: center;
}

.history-item--skeleton .skeleton-line {
  height: 0.9rem;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.06) 25%,
    rgba(255, 255, 255, 0.12) 37%,
    rgba(255, 255, 255, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

.skeleton-line--title {
  width: 55%;
  margin-bottom: 0.5rem;
}

.skeleton-line--artist {
  width: 35%;
  height: 0.75rem;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 640px) {
  .last-songs {
    max-width: 100%;
    margin: 2rem auto;
    padding: 0rem 2rem;
  }

  .history-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
}
</style>
