import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// shortcut: palette test via ?palette=spin|navy, drop once a palette is chosen
const palette = new URLSearchParams(location.search).get('palette')
if (palette) document.documentElement.dataset.palette = palette

const app = createApp(App)
app.use(router)
app.mount('#app')