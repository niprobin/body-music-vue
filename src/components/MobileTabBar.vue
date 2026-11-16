<template>
  <nav class="tab-bar" aria-label="Navigation principale">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
    >
      <span class="tab-pill">
        <LucideIcon :icon="tab.icon" :size="22" />
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import LucideIcon from './LucideIcon.vue'

// Short labels on purpose: 4 tabs must fit at 320px. Desktop nav keeps long ones.
// Routes are flat, so router-link-active on "/" only matches "/" itself.
const tabs = [
  { to: '/', icon: 'house', label: 'Accueil' },
  { to: '/schedule', icon: 'calendar', label: 'Prog' },
  { to: '/last-songs', icon: 'music', label: 'Historique' },
  { to: '/albums', icon: 'disc', label: 'Albums' }
]
</script>

<style scoped>
.tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 990; /* under header player (998) and album sheet (1000) */
  display: flex;
  min-height: calc(64px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
  background: #0d141c;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.tab {
  flex: 1;
  min-width: 0;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-weight: 500;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.tab-pill {
  width: 56px;
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease;
}

.tab-label {
  font-size: 12px;
  line-height: 1;
}

.tab.router-link-active {
  color: #f3efe8;
  font-weight: 600;
}

.tab.router-link-active .tab-pill {
  background: rgba(243, 239, 232, 0.16);
}

.tab:active .tab-pill {
  box-shadow: inset 0 0 0 999px rgba(255, 255, 255, 0.06);
}

.tab:focus-visible .tab-pill {
  outline: 2px solid #f3efe8;
  outline-offset: 2px;
}

@media (min-width: 721px) {
  .tab-bar {
    display: none;
  }
}
</style>
