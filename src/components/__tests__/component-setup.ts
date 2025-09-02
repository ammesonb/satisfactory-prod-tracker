import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'

// Create a Vuetify instance for testing
const vuetify = createVuetify({
  components,
})

// Configure Vue Test Utils to use Vuetify globally
config.global.plugins = [vuetify]

// Mock CSS imports that Vuetify might use
vi.mock('vuetify/styles', () => ({}))
