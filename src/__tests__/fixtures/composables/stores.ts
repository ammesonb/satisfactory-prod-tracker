import { vi } from 'vitest'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'
import { mockFactoryStore } from './factoryStore'
import { mockThemeStore } from './themeStore'

// Main stores mock
export const mockGetStores = vi.fn(() => {
  const mockDataStore = createMockDataStore()
  return {
    dataStore: mockDataStore as IDataStore,
    factoryStore: mockFactoryStore as IFactoryStore,
    themeStore: mockThemeStore as IThemeStore,
    errorStore: {} as IErrorStore,
  }
})
