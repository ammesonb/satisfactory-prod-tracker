import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import { vi } from 'vitest'

// Mock all the stores at import time with fixture data
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(() => createMockDataStore()),
}))

vi.mock('@/stores/errors', () => ({
  useErrorStore: vi.fn(() => ({})),
}))
