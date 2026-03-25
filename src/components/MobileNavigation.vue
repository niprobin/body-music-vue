<template>
  <!-- Overlay backdrop -->
  <div class="nav-overlay" @click="$emit('close')"></div>

  <!-- Navigation popup -->
  <nav class="mobile-navigation-popup">
    <router-link to="/" class="nav-item" :class="{ active: isActive('/') }" @click="$emit('close')">
      <font-awesome-icon :icon="['fas', 'house']" class="nav-icon" />
      <span class="nav-label">Accueil</span>
    </router-link>
    <router-link to="/schedule" class="nav-item" :class="{ active: isActive('/schedule') }" @click="$emit('close')">
      <font-awesome-icon :icon="['fas', 'calendar']" class="nav-icon" />
      <span class="nav-label">Prog</span>
    </router-link>
    <router-link to="/last-songs" class="nav-item" :class="{ active: isActive('/last-songs') }" @click="$emit('close')">
      <font-awesome-icon :icon="['fas', 'music']" class="nav-icon" />
      <span class="nav-label">Historique</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits(['close'])
const route = useRoute()

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
/* Overlay backdrop */
.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 3001;
}

/* Navigation popup */
.mobile-navigation-popup {
  position: fixed;
  bottom: 48px; /* Above the player */
  left: 0;
  right: 0;
  background: #0c0c0c;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  z-index: 3002;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.75rem 0.5rem;
  min-height: 44px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  border-radius: 8px;
}

.nav-item:hover,
.nav-item.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.nav-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  line-height: 1;
}

/* Hide on desktop */
@media (min-width: 721px) {
  .nav-overlay,
  .mobile-navigation-popup {
    display: none;
  }
}
</style>