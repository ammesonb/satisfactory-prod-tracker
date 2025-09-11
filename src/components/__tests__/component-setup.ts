import { vi, beforeEach } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { createPinia, setActivePinia } from 'pinia'

// Create a Vuetify instance for testing
const vuetify = createVuetify({
  components,
})

config.global.plugins = [vuetify]

// Reset Pinia stores before each test by creating a fresh instance
beforeEach(() => {
  setActivePinia(createPinia())
})

// Mock CSS imports that Vuetify might use
vi.mock('vuetify/styles', () => ({}))
