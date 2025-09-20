import { vi } from 'vitest'
import { ref } from 'vue'
import type { Factory } from '@/types/factory'

// Create reactive refs that persist across calls for key properties
export const mockCurrentFactory = ref<Factory | null>(null)
export const mockSelectedFactory = ref('')
export const mockFactories = ref({})

// Factory store action mocks
export const mockAddFactory = vi.fn()
export const mockSetSelectedFactory = vi.fn()
export const mockRemoveFactory = vi.fn()
export const mockSetLinkBuiltState = vi.fn()
export const mockGetRecipeByName = vi.fn()
export const mockExportFactories = vi.fn()
export const mockImportFactories = vi.fn()

export const mockFactoryStore = {
  get selected() {
    return mockSelectedFactory.value
  },
  get currentFactory() {
    return mockCurrentFactory.value
  },
  get factories() {
    return mockFactories.value
  },
  get hasFactories() {
    return Object.keys(mockFactories.value).length > 0
  },
  get factoryList() {
    return Object.values(mockFactories.value)
  },
  addFactory: mockAddFactory,
  setSelectedFactory: mockSetSelectedFactory,
  removeFactory: mockRemoveFactory,
  setLinkBuiltState: mockSetLinkBuiltState,
  getRecipeByName: mockGetRecipeByName,
  exportFactories: mockExportFactories,
  importFactories: mockImportFactories,
}
