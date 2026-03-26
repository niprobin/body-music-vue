<template>
  <div class="star-rating" :class="`star-rating--${size}`">
    <LucideIcon
      v-for="n in 5"
      :key="n"
      icon="star"
      :class="['star', { 'star--filled': n <= rating }]"
    />
  </div>
</template>

<script>
import LucideIcon from './LucideIcon.vue'

export default {
  name: 'StarRating',
  components: {
    LucideIcon
  },
  props: {
    rating: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 5
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['medium', 'large'].includes(value)
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.star-rating--medium {
  font-size: 0.9rem;
}

.star-rating--large {
  font-size: 0.9rem;
  gap: 0.3rem;
}

.star {
  color: #475569;
  transition: color 0.2s ease;
}

.star--filled {
  color: #facc15;
}
</style>
