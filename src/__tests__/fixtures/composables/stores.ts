import { vi } from 'vitest'
import { ref } from 'vue'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'
import type { Factory } from '@/types/factory'

// Create reactive refs that persist across calls for key properties
export const mockCurrentFactory = ref<Factory | null>(null)
export const mockSelectedFactory = ref('')
export const mockFactories = ref({})
export const mockIsDark = ref(false)

// Main stores mock
export const mockGetStores = vi.fn(() => {
  const mockDataStore = createMockDataStore()
  return {
    dataStore: mockDataStore as IDataStore,
    factoryStore: {
      selected: mockSelectedFactory.value,
      currentFactory: mockCurrentFactory.value,
      factories: mockFactories.value,
    } as Partial<IFactoryStore>,
    themeStore: { isDark: mockIsDark.value } as IThemeStore,
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
