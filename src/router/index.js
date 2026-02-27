import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Schedule from '../pages/Schedule.vue'
import LastSongs from '../pages/LastSongs.vue'
import Albums from '../pages/Albums.vue'
import { useAnalytics } from '../composables/useAnalytics.js'

export const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/schedule', name: 'Schedule', component: Schedule },
  { path: '/last-songs', name: 'LastSongs', component: LastSongs },
  { path: '/albums', name: 'Albums', component: Albums },
  { path: '/albums/:slug', name: 'AlbumReview', component: () => import('../pages/AlbumReview.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Track page views for analytics
const { trackPageView } = useAnalytics()
router.afterEach((to) => {
  trackPageView(to.path)
})

export default router
