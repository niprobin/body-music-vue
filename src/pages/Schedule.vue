<template>
  <section class="schedule-page">
    <div class="schedule-header">
      <h1>Programmation</h1>
      <p>On commence la journée doucement puis on monte tout doucement le rythme !</p>
    </div>

    <div class="schedule-list">
      <div v-for="(shows, day) in schedule" :key="day" class="schedule-day">
        <div class="schedule-day__header">
          <h3>{{ day }}</h3>
          <span v-if="day === currentDay" class="schedule-day__tag">Aujourd'hui</span>
        </div>
        <div class="schedule-day__body">
          <article v-for="show in shows" :key="day + show.start + show.end + show.show"
            :class="['schedule-item', { 'schedule-item--current': isCurrentShow(day, show) }]">
            <div class="schedule-item__time">{{ show.start }} – {{ show.end }}</div>
            <div class="schedule-item__name">{{ show.show }}</div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { parisNow, currentSlot } from '../lib/schedule.js'

const schedule = ref({})
const now = ref(new Date())
let intervalId

const currentDay = computed(() => parisNow(now.value).day)
const current = computed(() => currentSlot(schedule.value, now.value))

function isCurrentShow(day, show) {
  return current.value?.day === day && current.value.show === show
}

async function loadSchedule() {
  try {
    const response = await fetch('/schedule.json')
    schedule.value = await response.json()
  } catch (e) {
    console.error('Error loading schedule:', e)
  }
}

onMounted(() => {
  loadSchedule()
  intervalId = setInterval(() => {
    now.value = new Date()
  }, 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.schedule-page {
  max-width: 100%;
  margin: 2rem auto;
  padding:0rem 6rem;
  padding-bottom:5vh;
}

.schedule-header {
  margin-bottom: 1.5rem;
}

.schedule-header p {
  margin: 0.3rem 0 0;
}

.schedule-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
}

.schedule-day {
  border:1px solid var(--line-strong);
  border-radius: 16px;
  overflow: hidden;
}

.schedule-day__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0rem 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--muted) 20%, transparent);
}

.schedule-day__tag {
  font-size: 0.75rem;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  border: 1px solid var(--text);
  background-color: var(--text);
  color:var(--on-text);
}

.schedule-day__body {
  display: flex;
  flex-direction: column;
}

.schedule-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom:1px solid var(--line-strong);
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item__time {
  font-weight: 500;
}

.schedule-item--current {
  background: var(--text);
  color:var(--on-text);
  border-left: 3px solid var(--text);
}

@media (max-width: 720px) {

  .schedule-page {
  max-width: 100%;
  margin: 2rem auto;
  padding:0rem 2rem;
}

  .schedule-item {
    grid-template-columns: 120px 1fr;
    gap: 0.5rem;
  }

  .schedule-item__time {
    font-size: 0.9rem;
  }
}

@media (min-width: 960px) {
  .schedule-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
