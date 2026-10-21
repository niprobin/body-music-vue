<template>
  <component :is="iconComponent" v-if="iconComponent" :size="iconSize" />
  <span v-else class="icon-missing">{{ icon }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useIcons } from '../composables/useIcons.js'

// Classes and other attributes fall through to the rendered icon.
const props = defineProps({
  // Lucide icon name registered in useIcons
  icon: {
    type: String,
    required: true
  },
  // Size - a named size (xs, sm, medium, lg, xl, 2xl) or pixels
  size: {
    type: [String, Number],
    default: 'medium'
  }
})

const { getIcon, getIconSize } = useIcons()

const iconComponent = computed(() => getIcon(props.icon))

const iconSize = computed(() => {
  return typeof props.size === 'number' ? props.size : getIconSize(props.size)
})
</script>

<style scoped>
.icon-missing {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>