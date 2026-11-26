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
  /* 64px total = 1px border + 3px + 56px tab + 4px. Must match the
     .app-shell padding-bottom in App.vue. */
  height: calc(64px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  padding: 3px 8px calc(4px + env(safe-area-inset-bottom));
  background: var(--bar);
  border-top: 1px solid color-mix(in srgb, var(--muted) 20%, transparent);
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
  color: var(--muted);
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
  color: var(--text);
  font-weight: 600;
}

.tab.router-link-active .tab-pill {
  background: color-mix(in srgb, var(--text) 16%, transparent);
}

.tab:active .tab-pill {
  box-shadow: inset 0 0 0 999px color-mix(in srgb, var(--text) 06%, transparent);
}

.tab:focus-visible .tab-pill {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}

@media (min-width: 721px) {
  .tab-bar {
    display: none;
  }
}
</style>
