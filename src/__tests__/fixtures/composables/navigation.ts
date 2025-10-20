import { vi } from 'vitest'
import { computed } from 'vue'

import type { RecipeNode } from '@/logistics/graph-node'

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
