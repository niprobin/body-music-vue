import { ref, onMounted, onBeforeUnmount } from 'vue'

// The project's single breakpoint.
const QUERY = '(max-width: 720px)'

// Reactive "is the viewport mobile-sized". False during SSG, then
// synced with the media query once mounted.
export function useIsMobile() {
  const isMobile = ref(false)
  let mql = null
  const update = () => { isMobile.value = mql.matches }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = window.matchMedia(QUERY)
    update()
    mql.addEventListener('change', update)
  })

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', update)
  })

  return isMobile
}
