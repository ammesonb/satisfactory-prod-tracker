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

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import './styles/responsive.css'

import App from '@/App.vue'
import {
  CLOUD_SYNC_STORE_KEY,
  DATA_STORE_KEY,
  ERROR_STORE_KEY,
  FACTORY_STORE_KEY,
  GOOGLE_AUTH_STORE_KEY,
  THEME_STORE_KEY,
} from '@/composables/useStores'
import {
  useCloudSyncStore,
  useDataStore,
  useErrorStore,
  useFactoryStore,
  useGoogleAuthStore,
  useThemeStore,
} from '@/stores'

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
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1440,
      xxl: 1920,
    },
  },
  defaults: {
    VTextField: {
      density: 'comfortable',
    },
    VSelect: {
      density: 'comfortable',
    },
    VAutocomplete: {
      density: 'comfortable',
    },
  },
})

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)
app.use(pinia)
app.use(vuetify)

// Initialize stores
const cloudSyncStore = useCloudSyncStore()
const dataStore = useDataStore()
const factoryStore = useFactoryStore()
const themeStore = useThemeStore()
const errorStore = useErrorStore()
const googleAuthStore = useGoogleAuthStore()

// Provide stores for dependency injection
app.provide(CLOUD_SYNC_STORE_KEY, cloudSyncStore)
app.provide(DATA_STORE_KEY, dataStore)
app.provide(FACTORY_STORE_KEY, factoryStore)
app.provide(THEME_STORE_KEY, themeStore)
app.provide(ERROR_STORE_KEY, errorStore)
app.provide(GOOGLE_AUTH_STORE_KEY, googleAuthStore)

// Initialize theme store to sync with Vuetify
app.mount('#app')

// Set initial theme after mount
themeStore.setTheme(themeStore.isDark)

// Initialize Google API client
googleAuthStore.initialize().catch((err) => {
  console.error('Failed to initialize Google API client:', err)
})
