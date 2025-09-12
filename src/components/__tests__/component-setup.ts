import { vi, beforeEach } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { createPinia, setActivePinia } from 'pinia'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import {
  DATA_STORE_KEY,
  FACTORY_STORE_KEY,
  THEME_STORE_KEY,
  ERROR_STORE_KEY,
} from '@/composables/useStores'

// Create a Vuetify instance for testing
const vuetify = createVuetify({
  components,
})

// Create mock stores
const mockDataStore = createMockDataStore()
const mockFactoryStore = {}
const mockThemeStore = {}
const mockErrorStore = {}

// Configure global plugins and provides for integration testing
config.global.plugins = [vuetify]
config.global.provide = {
  [DATA_STORE_KEY as symbol]: mockDataStore,
  [FACTORY_STORE_KEY as symbol]: mockFactoryStore,
  [THEME_STORE_KEY as symbol]: mockThemeStore,
  [ERROR_STORE_KEY as symbol]: mockErrorStore,
}

// Reset Pinia stores before each test by creating a fresh instance
beforeEach(() => {
  setActivePinia(createPinia())
})

// Components will be auto-imported via unplugin-vue-components in vitest.config.ts
// Mock CSS imports that Vuetify might use
vi.mock('vuetify/styles', () => ({}))
