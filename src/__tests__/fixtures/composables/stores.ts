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

// Factory function for custom implementations
export const createMockUseStores = (
  overrides: {
    dataStore?: Partial<IDataStore>
    factoryStore?: Partial<IFactoryStore>
    themeStore?: Partial<IThemeStore>
    errorStore?: Partial<IErrorStore>
  } = {},
) => {
  return () => {
    const mockDataStore = createMockDataStore()
    return {
      dataStore: { ...mockDataStore, ...overrides.dataStore } as IDataStore,
      factoryStore: { ...overrides.factoryStore } as IFactoryStore,
      themeStore: { isDark: false, ...overrides.themeStore } as IThemeStore,
      errorStore: { ...overrides.errorStore } as IErrorStore,
    }
  }
}
