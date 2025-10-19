import { vi } from 'vitest'

import { mockErrorStore } from '@/__tests__/fixtures/composables/errorStore'
import { mockFactoryStore } from '@/__tests__/fixtures/composables/factoryStore'
import { mockThemeStore } from '@/__tests__/fixtures/composables/themeStore'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { IDataStore, IErrorStore, IFactoryStore, IThemeStore } from '@/types/stores'

// Create stores once to ensure consistency across all getters
const mockStores = {
  dataStore: createMockDataStore() as IDataStore,
  factoryStore: mockFactoryStore as IFactoryStore,
  themeStore: mockThemeStore as IThemeStore,
  errorStore: mockErrorStore as IErrorStore,
}

// Main stores mock
export const mockGetStores = vi.fn(() => mockStores)

// Individual store getters - reusable for components that use individual getters
export const mockGetDataStore = vi.fn(() => mockStores.dataStore)
export const mockGetFactoryStore = vi.fn(() => mockStores.factoryStore)
export const mockGetThemeStore = vi.fn(() => mockStores.themeStore)
export const mockGetErrorStore = vi.fn(() => mockStores.errorStore)

// Complete useStores mock - use this for full mocking
export const mockUseStores = {
  getStores: mockGetStores,
  getDataStore: mockGetDataStore,
  getFactoryStore: mockGetFactoryStore,
  getThemeStore: mockGetThemeStore,
  getErrorStore: mockGetErrorStore,
}
