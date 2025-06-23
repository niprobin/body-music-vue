<template>
  <section class="schedule">
    <h1>La programmation</h1>
    <div ref="scheduleList" class="schedule-list">
      <div v-for="(shows, day) in schedule" :key="day" :class="['schedule-day', { 'current-day': day === currentDay }]"
        :id="day === currentDay ? 'current-day' : null">
        <h3>{{ day }}</h3>
        <div v-for="show in shows" :key="show.start + show.show"
          :class="['schedule-item', { 'current-show': isCurrentShow(day, show) }]">
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
    const response = await fetch('/schedule.json')
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
  width: 70vw;
  max-width: 1200px;
  min-width: 240px;
  margin: 0 auto;
  padding-bottom: 100px;
}

.schedule-list {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  font-size: 12px;
  text-transform: uppercase;
  padding: 5px;
  justify-items: center;
  /* Center grid items horizontally */
}

.schedule-day {
  /* Remove width: 95%; */
  color: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  gap: 5px;
  width: 100%;
  /* Make it fill the grid cell */
  box-sizing: border-box;
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

@media (max-width: 600px) {

  .schedule {
    width: 95%;
    padding: 0px 0px 86px 0px;
    margin: 0 auto;
  }

  .schedule-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .schedule-day {
    padding: 8px;
  }

  h1 {
    width: 100%;
    text-align: center;
  }
}
</style>