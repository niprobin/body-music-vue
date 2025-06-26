import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "name": "Body Music",
  "short_name": "Body Music",
  "id": "/",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#1C1B22",
  "theme_color": "#1C1B22",
  "description": "Body Music Radio - La radio pour tout le monde",
  "orientation": "portrait",
  "dir": "ltr",
  "prefer_related_applications": false,
  "launch_handler": {
    "client_mode": "auto"
  },
  "icons": [
    {
      "src": "/browser_icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshot1.png",
      "sizes": "538x1145",
      "type": "image/png",
      "label": "Home screen"
    },
    {
      "src": "/screenshot2.png",
      "sizes": "538x1145",
      "type": "image/png",
      "label": "Schedule"
    },
    {
      "src": "/screenshot3.png",
      "sizes": "538x1145",
      "type": "image/png",
      "label": "Last songs played"
    }
  ],
  "categories": [
    "music",
    "audio",
    "entertainment"
  ]
      }
    })
  ]
})