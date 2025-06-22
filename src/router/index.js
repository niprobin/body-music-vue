import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Schedule from '../pages/Schedule.vue'
import LastSongs from '../pages/LastSongs.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/schedule', name: 'Schedule', component: Schedule },
  { path: '/last-songs', name: 'LastSongs', component: LastSongs }
  // ...other routes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router