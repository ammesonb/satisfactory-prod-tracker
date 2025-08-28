import { vi } from 'vitest'
import { createMockDataStore } from './recipe-fixtures'

// Mock all the stores at import time with fixture data
vi.mock('@/stores/data', () => ({
  useDataStore: vi.fn(() => createMockDataStore()),
}))

vi.mock('@/stores/errors', () => ({
  useErrorStore: vi.fn(() => ({})),
}))
