import { vi } from 'vitest'
import { computed, ref } from 'vue'

import type { FloorFormData } from '@/composables/useFloorManagement'
import type { RecipeNode } from '@/logistics/graph-node'
import type { Floor } from '@/types/factory'

// Floor Management mocks
export const mockShowFloorEditor = ref(false)
export const mockEditFloorIndex = ref<number | null>(null)

export const mockGetEligibleFloors = vi.fn(() => [
  { title: 'Ground Floor', value: 0, disabled: false },
  { title: 'Floor 1', value: 1, disabled: false },
  { title: 'Floor 2', value: 2, disabled: false },
])
export const mockMoveRecipe = vi.fn()
export const mockGetFloorDisplayName = vi.fn(
  (floorNumber: number, floor?: Floor) =>
    `Floor ${floorNumber}` + (floor?.name ? ` - ${floor.name}` : ''),
)
export const mockOpenFloorEditor = vi.fn((floorIndex?: number) => {
  mockEditFloorIndex.value = floorIndex ?? null
  mockShowFloorEditor.value = true
})
export const mockCloseFloorEditor = vi.fn(() => {
  mockShowFloorEditor.value = false
  mockEditFloorIndex.value = null
})
export const mockGetFloorFormsTemplate = vi.fn((): FloorFormData[] => [])
export const mockHasFloorFormChanges = vi.fn(() => false)
export const mockUpdateFloorsFromForms = vi.fn()

export const mockUseFloorManagement = vi.fn(() => ({
  showFloorEditor: mockShowFloorEditor,
  editFloorIndex: mockEditFloorIndex,
  getEligibleFloors: mockGetEligibleFloors,
  moveRecipe: mockMoveRecipe,
  getFloorDisplayName: mockGetFloorDisplayName,
  openFloorEditor: mockOpenFloorEditor,
  closeFloorEditor: mockCloseFloorEditor,
  getFloorFormsTemplate: mockGetFloorFormsTemplate,
  hasFloorFormChanges: mockHasFloorFormChanges,
  updateFloorsFromForms: mockUpdateFloorsFromForms,
}))

// Floor Navigation mocks
export const mockExpandedFloors = vi.fn(() => [])
export const mockExpandFloor = vi.fn()
export const mockCollapseFloor = vi.fn()
export const mockSetRecipeExpansionFromCompletion = vi.fn()
export const mockToggleFloor = vi.fn()
export const mockNavigateToElement = vi.fn()
export const mockInitializeExpansion = vi.fn()
export const mockNavigateToRecipe = vi.fn()

export const mockUseFloorNavigation = vi.fn(() => ({
  expandedFloors: mockExpandedFloors,
  expandFloor: mockExpandFloor,
  collapseFloor: mockCollapseFloor,
  setRecipeExpansionFromCompletion: mockSetRecipeExpansionFromCompletion,
  toggleFloor: mockToggleFloor,
  navigateToElement: mockNavigateToElement,
  initializeExpansion: mockInitializeExpansion,
  navigateToRecipe: mockNavigateToRecipe,
}))

// Utility mocks
export const mockFormatRecipeId = vi.fn(() => 'test-recipe-id')
export const mockFormatFloorId = vi.fn((index: number) => `floor-${index}`)

// Link Data mocks
export const mockUseLinkData = vi.fn(() => ({
  linkId: computed(() => 'test-link-id'),
  materialItem: computed(() => ({ name: 'Iron Ore', icon: 'Desc_OreIron_C' })),
  linkTarget: computed(() => 'test-target'),
  isRecipe: computed(() => false),
  targetRecipe: computed<RecipeNode | null>(() => null),
  displayName: computed(() => 'Test Display Name'),
  transportIcon: computed(() => 'Desc_ConveyorBeltMk1_C'),
}))
