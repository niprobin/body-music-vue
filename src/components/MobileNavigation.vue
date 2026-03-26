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


/* Navigation popup */
.mobile-navigation-popup {
  position: fixed;
  top: 9vh; /* below player */
  left: 0;
  right: 0;
  background-color: #111;
  border-top:1px solid rgba(70, 69, 69, 0.95);
  border-bottom:1px solid rgba(70, 69, 69, 0.95);
  transition: border 0.5s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height:8vh;
  z-index: 998;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 6vh;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  border-radius: 8px;
}


.nav-item.active {
  color: #111;
  background: #f3efe8;
}

.nav-icon {
  font-size: 1rem;
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