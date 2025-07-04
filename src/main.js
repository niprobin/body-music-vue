import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlay, faPause, faHouse, faCalendar, faMusic, faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faPlay, faPause, faHouse, faCalendar, faMusic, faLink)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')