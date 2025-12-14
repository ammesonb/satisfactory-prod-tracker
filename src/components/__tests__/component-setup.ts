import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import { mockCloudSyncStore } from '@/__tests__/fixtures/composables/cloudSyncStore'
import { mockGoogleAuthStore } from '@/__tests__/fixtures/composables/googleAuthStore'
import {
  CLOUD_SYNC_STORE_KEY,
  DATA_STORE_KEY,
  ERROR_STORE_KEY,
  FACTORY_STORE_KEY,
  GOOGLE_AUTH_STORE_KEY,
  THEME_STORE_KEY,
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
  [CLOUD_SYNC_STORE_KEY as symbol]: mockCloudSyncStore,
  [GOOGLE_AUTH_STORE_KEY as symbol]: mockGoogleAuthStore,
}

// Reset Pinia stores before each test by creating a fresh instance
beforeEach(() => {
  setActivePinia(createPinia())
})

// Components will be auto-imported via unplugin-vue-components in vitest.config.ts
// Mock CSS imports that Vuetify might use
vi.mock('vuetify/styles', () => ({}))

// Mock visualViewport for Vuetify dialog tests
if (!globalThis.visualViewport) {
  Object.defineProperty(globalThis, 'visualViewport', {
    value: {
      width: 1024,
      height: 768,
      scale: 1,
      pageLeft: 0,
      pageTop: 0,
      offsetLeft: 0,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    writable: true,
    configurable: true,
  })
}
