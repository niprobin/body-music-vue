<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="iconSize"
    :class="iconClass"
    v-bind="$attrs"
  />
  <span v-else class="icon-missing">{{ iconName }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { useIcons } from '../composables/useIcons.js'

const props = defineProps({
  // Icon name (string) - matches Font Awesome names where possible
  icon: {
    type: [String, Array],
    required: true
  },
  // Size - can be string (xs, sm, medium, lg, xl, 2xl) or number
  size: {
    type: [String, Number],
    default: 'medium'
  },
  // Additional CSS classes
  class: {
    type: String,
    default: ''
  }
})

const { getIcon, getIconSize } = useIcons()

// Handle different icon prop formats (for Font Awesome compatibility)
const iconName = computed(() => {
  if (Array.isArray(props.icon)) {
    // Handle ['fas', 'house'] format
    return props.icon[1]
  }
  if (typeof props.icon === 'string') {
    // Handle "house" or "fa-solid fa-house" format
    if (props.icon.includes('fa-solid') || props.icon.includes('fa-')) {
      // Extract icon name from "fa-solid fa-house" format
      return props.icon.split(' ').pop().replace('fa-', '')
    }
    return props.icon
  }
  return props.icon
})

// Get the Lucide component
const iconComponent = computed(() => {
  return getIcon(iconName.value)
})

// Calculate icon size
const iconSize = computed(() => {
  if (typeof props.size === 'number') {
    return props.size
  }
  return getIconSize(props.size)
})

// Combine classes
const iconClass = computed(() => {
  return props.class
})
</script>

<style scoped>
.icon-missing {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>