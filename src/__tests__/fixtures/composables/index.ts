import { vi } from 'vitest'
import { computed, ref } from 'vue'
import { createMockDataStore } from '@/__tests__/fixtures/stores/dataStore'
import type { IDataStore, IFactoryStore, IThemeStore, IErrorStore } from '@/types/stores'
import type { Floor, Factory } from '@/types/factory'

// Exportable mock functions that can be used in vi.mock() and customized
export const mockGetStores = vi.fn()
export const mockUseFloorManagement = vi.fn()
export const mockUseFloorNavigation = vi.fn()
export const mockUseRecipeStatus = vi.fn()
export const mockFormatRecipeId = vi.fn()
export const mockFormatFloorId = vi.fn()
export const mockUseLinkData = vi.fn()

// Create reactive refs that persist across calls for key properties
const mockCurrentFactory = ref<Factory | null>(null)
const mockSelectedFactory = ref('')
const mockFactories = ref({})
const mockIsDark = ref(false)

// Set default implementations
mockGetStores.mockImplementation(() => {
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

// Export the refs so tests can modify them
export { mockCurrentFactory, mockSelectedFactory, mockFactories, mockIsDark }

mockUseFloorManagement.mockImplementation(() => ({
  getEligibleFloors: vi.fn(() => [
    { title: 'Ground Floor', value: 0, disabled: false },
    { title: 'Floor 1', value: 1, disabled: false },
    { title: 'Floor 2', value: 2, disabled: false },
  ]),
  moveRecipe: vi.fn(),
  getFloorDisplayName: vi.fn(
    (floorNumber: number, floor?: Floor) =>
      `Floor ${floorNumber}` + (floor?.name ? ` - ${floor.name}` : ''),
  ),
  openFloorEditor: vi.fn(),
}))

mockUseFloorNavigation.mockImplementation(() => ({
  expandedFloors: vi.fn(() => []),
  expandFloor: vi.fn(),
  collapseFloor: vi.fn(),
  setRecipeExpansionFromCompletion: vi.fn(),
  toggleFloor: vi.fn(),
  navigateToElement: vi.fn(),
  initializeExpansion: vi.fn(),
  navigateToRecipe: vi.fn(),
}))

mockUseRecipeStatus.mockImplementation(() => ({
  isRecipeComplete: vi.fn(() => false),
  setRecipeBuilt: vi.fn(),
  isLinkBuilt: vi.fn(() => false),
  setLinkBuilt: vi.fn(),
  getRecipePanelValue: vi.fn((recipe) => `${recipe.batchNumber || 0}-${recipe.recipe.name}`),
  leftoverProductsAsLinks: vi.fn(() => [
    { source: 'test-recipe', sink: '', material: 'test-material', amount: 1 },
  ]),
}))

mockFormatRecipeId.mockImplementation(() => 'test-recipe-id')
mockFormatFloorId.mockImplementation((index: number) => `floor-${index}`)

mockUseLinkData.mockImplementation(() => ({
  linkId: computed(() => 'test-link-id'),
  materialItem: computed(() => ({ name: 'Iron Ore', icon: 'Desc_OreIron_C' })),
  linkTarget: computed(() => 'test-target'),
  isRecipe: computed(() => false),
  targetRecipe: computed(() => null),
  displayName: computed(() => 'Test Display Name'),
  transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
}))

// Factory functions for custom implementations (keep for advanced use cases)
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
