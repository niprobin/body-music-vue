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
import { ref, onMounted, onUnmounted } from 'vue'

const schedule = ref({})
const currentDay = ref('')
const currentTime = ref(0)
let intervalId

function getCurrentDay() {
  return new Date().toLocaleString('fr-FR', { weekday: 'long' })
}

function getCurrentTime() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function isCurrentShow(day, show) {
  if (day !== currentDay.value) return false
  const [startH, startM] = show.start.split(':').map(Number)
  const [endH, endM] = show.end.split(':').map(Number)
  const start = startH * 60 + startM
  const end = endH * 60 + endM
  return currentTime.value >= start && currentTime.value < end
}

async function loadSchedule() {
  try {
    const response = await fetch('/schedule.json')
    schedule.value = await response.json()
    currentDay.value = getCurrentDay()
    currentTime.value = getCurrentTime()
  } catch (e) {
    console.error('Error loading schedule:', e)
  }
}

onMounted(() => {
  loadSchedule()
  intervalId = setInterval(() => {
    currentDay.value = getCurrentDay()
    currentTime.value = getCurrentTime()
  }, 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.schedule-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem 4rem;
}

.schedule-header {
  margin-bottom: 1.5rem;
}

.schedule-header p {
  margin: 0.3rem 0 0;
  color: #94a3b8;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.schedule-day {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.65);
  overflow: hidden;
}

.schedule-day__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.schedule-day__tag {
  font-size: 0.75rem;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item__time {
  font-weight: 500;
  color: #f8fafc;
}

.schedule-item__name {
  color: #cbd5f5;
}

.schedule-item--current {
  background: rgba(56, 189, 248, 0.08);
  border-left: 3px solid #38bdf8;
}

@media (max-width: 640px) {
  .schedule-item {
    grid-template-columns: 120px 1fr;
    gap: 0.5rem;
  }

  .schedule-item__time {
    font-size: 0.9rem;
  }
}
</style>
