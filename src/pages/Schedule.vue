<template>
  <section class="schedule">
    <h1>La programmation</h1>
    <div ref="scheduleList" class="schedule-list">
      <div
        v-for="(shows, day) in schedule"
        :key="day"
        :class="['schedule-day', { 'current-day': day === currentDay }]"
        :id="day === currentDay ? 'current-day' : null"
      >
        <h3>{{ day }}</h3>
        <div
          v-for="show in shows"
          :key="show.start + show.show"
          :class="['schedule-item', { 'current-show': isCurrentShow(day, show) }]"
        >
          {{ show.start }} — {{ show.end }} | {{ show.show }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const schedule = ref({})
const currentDay = ref('')
const currentTime = ref(0)
const scheduleList = ref(null)

function getCurrentDay() {
  return new Date().toLocaleString('en-US', { weekday: 'long' })
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
    const response = await fetch('/src/data/schedule.json')
    schedule.value = await response.json()
    currentDay.value = getCurrentDay()
    currentTime.value = getCurrentTime()
    // Removed scroll to current day
  } catch (e) {
    console.error('Error loading schedule:', e)
  }
}

onMounted(() => {
  loadSchedule()
  setInterval(() => {
    currentDay.value = getCurrentDay()
    currentTime.value = getCurrentTime()
  }, 60 * 1000) // Update every minute
})
</script>

<style scoped>
.schedule {
  padding: 2rem 1rem 4rem 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.schedule-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  font-size: 12px;
  text-transform: uppercase;
}

.schedule-day {
  width: 100%;
  color: #fff;
  border-radius: 4px;
  padding: 10px;
  background-color: #262424;
  box-shadow: rgba(90, 88, 88, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.schedule-item {
  color: #fff;
  padding: 5px;
  background: #cccccc97;
  border-left: 5px solid #ccc;
  border-radius: 4px;
  margin: 5px 0;
}

.current-show {
  border-left: 5px solid #f16896;
  background: #ffedf3;
  font-weight: bold;
  color: #333;
}
</style>