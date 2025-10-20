import { vi } from 'vitest'
import { ref } from 'vue'

import type { FloorFormData } from '@/composables/useFloorManagement'
import type { Floor } from '@/types/factory'

// Shared state (module-level refs)
export const mockShowFloorEditor = ref(false)
export const mockEditFloorIndex = ref<number | null>(null)

// Floor Management action mocks
export const mockGetEligibleFloors = vi.fn(() => [
  { title: 'Ground Floor', value: 0, disabled: false },
  { title: 'Floor 1', value: 1, disabled: false },
  { title: 'Floor 2', value: 2, disabled: false },
])
export const mockMoveRecipe = vi.fn()
export const mockGetFloorDisplayName = vi.fn((index: number, floor: Floor) => {
  return floor.name ? `Floor ${index} - ${floor.name}` : `Floor ${index}`
})
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
export const mockCanRemoveFloor = vi.fn(() => true)
export const mockRemoveFloor = vi.fn()
export const mockInsertFloor = vi.fn()
export const mockFloorMatches = vi.fn()

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
  canRemoveFloor: mockCanRemoveFloor,
  removeFloor: mockRemoveFloor,
  insertFloor: mockInsertFloor,
  floorMatches: mockFloorMatches,
}))
