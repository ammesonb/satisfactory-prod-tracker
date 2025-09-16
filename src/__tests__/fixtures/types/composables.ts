import { vi } from 'vitest'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { ItemOption } from '@/types/data'
import type { RecipeNode } from '@/logistics/graph-node'
import type {
  UseFloorManagement,
  UseRecipeStatus,
  UseFloorNavigationHelpers,
} from '@/types/composables'

/**
 * Mock type for useSelection composable return value
 */
export type MockUseSelection = {
  selectedSet: ComputedRef<Set<string>>
  allSelected: ComputedRef<boolean>
  someSelected: ComputedRef<boolean>
  toggleAll: ReturnType<typeof vi.fn>
  toggleItem: ReturnType<typeof vi.fn>
  isSelected: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useSelection composable
 */
export const createMockUseSelection = (): MockUseSelection => ({
  selectedSet: computed(() => new Set<string>()),
  allSelected: computed(() => false),
  someSelected: computed(() => false),
  toggleAll: vi.fn(),
  toggleItem: vi.fn(),
  isSelected: vi.fn(() => false),
})

/**
 * Mock type for useDataSearch composable return value
 */
export type MockUseDataSearch = {
  searchInput: Ref<string>
  filteredItems: ComputedRef<ItemOption[]>
  updateSearch: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useDataSearch composable
 */
export const createMockUseDataSearch = (items: ItemOption[] = []): MockUseDataSearch => ({
  searchInput: ref(''),
  filteredItems: computed(() => items),
  updateSearch: vi.fn(),
})

export type MockUseFloorManagement = UseFloorManagement & {
  openFloorEditor: ReturnType<typeof vi.fn>
  closeFloorEditor: ReturnType<typeof vi.fn>
  getFloorDisplayName: ReturnType<typeof vi.fn>
  getEligibleFloors: ReturnType<typeof vi.fn>
  updateFloorName: ReturnType<typeof vi.fn>
  updateFloorIcon: ReturnType<typeof vi.fn>
  updateFloors: ReturnType<typeof vi.fn>
  moveRecipe: ReturnType<typeof vi.fn>
  getFloorFormsTemplate: ReturnType<typeof vi.fn>
  hasFloorFormChanges: ReturnType<typeof vi.fn>
  updateFloorsFromForms: ReturnType<typeof vi.fn>
}

export const createMockUseFloorManagement = (): MockUseFloorManagement => ({
  showFloorEditor: ref(false),
  editFloorIndex: ref(null),
  openFloorEditor: vi.fn(),
  closeFloorEditor: vi.fn(),
  getFloorDisplayName: vi.fn((floorIndex: number) => `Floor ${floorIndex}`),
  currentFactoryFloors: computed(() => []),
  getEligibleFloors: vi.fn(() => []),
  updateFloorName: vi.fn(),
  updateFloorIcon: vi.fn(),
  updateFloors: vi.fn(),
  moveRecipe: vi.fn(),
  getFloorFormsTemplate: vi.fn(() => []),
  hasFloorFormChanges: vi.fn(() => false),
  updateFloorsFromForms: vi.fn(),
})

export type MockUseRecipeStatus = UseRecipeStatus & {
  isRecipeComplete: ReturnType<typeof vi.fn>
  setRecipeBuilt: ReturnType<typeof vi.fn>
  isLinkBuilt: ReturnType<typeof vi.fn>
  setLinkBuilt: ReturnType<typeof vi.fn>
  getRecipePanelValue: ReturnType<typeof vi.fn>
  leftoverProductsAsLinks: ReturnType<typeof vi.fn>
}

export const createMockUseRecipeStatus = (): MockUseRecipeStatus => ({
  isRecipeComplete: vi.fn(() => false),
  setRecipeBuilt: vi.fn(),
  isLinkBuilt: vi.fn(() => false),
  setLinkBuilt: vi.fn(),
  getRecipePanelValue: vi.fn((recipe: RecipeNode) => `${recipe.batchNumber}-${recipe.recipe.name}`),
  leftoverProductsAsLinks: vi.fn(() => []),
})

export type MockUseFloorNavigationHelpers = UseFloorNavigationHelpers & {
  formatFloorId: ReturnType<typeof vi.fn>
  formatRecipeId: ReturnType<typeof vi.fn>
}

export const createMockUseFloorNavigationHelpers = (): MockUseFloorNavigationHelpers => ({
  formatFloorId: vi.fn((floorIndex: number) => `floor-${floorIndex}`),
  formatRecipeId: vi.fn(
    (floorIndex: number, recipeName: string) => `recipe-${floorIndex}-${recipeName}`,
  ),
})
