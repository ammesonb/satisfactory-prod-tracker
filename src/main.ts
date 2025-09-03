/**
 * Satisfactory Production Tracker
 *
 * This application allows users to track and visualize Satisfactory factory production chains.
 * Users can:
 * - Add factories with a name and icon
 * - Input resolved recipes for each factory
 * - View production chain/links visualization on the main page
 * - Navigate between different factories using the rail navigation drawer
 *
 * The app uses Vue 3 + Vuetify for UI, Pinia for state management, and a graph solver
 * for processing recipe chains into displayable production networks.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'

import App from '@/App.vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useThemeStore } from '@/stores/theme'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
})

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)
app.use(pinia)
app.use(vuetify)

// Initialize theme store to sync with Vuetify
app.mount('#app')

// Set initial theme after mount
const themeStore = useThemeStore()
themeStore.setDarkTheme(themeStore.isDark)
