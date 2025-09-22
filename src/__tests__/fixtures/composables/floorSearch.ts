import { vi } from 'vitest'
import { ref, type Ref } from 'vue'
import type { Floor } from '@/types/factory'

export const mockSearchInput = ref('')
export const mockFilteredFloors: Ref<Floor[]> = ref([])
export const mockUpdateSearch = vi.fn((value: string) => {
  mockSearchInput.value = value
})

export const mockUseFloorSearch = vi.fn((floors: Ref<Floor[] | undefined>) => {
  // Add originalIndex to floors for testing
  const floorsWithIndex = floors.value?.map((floor, index) => ({
    ...floor,
    originalIndex: index,
  }))

  return {
    searchInput: mockSearchInput,
    filteredFloors: ref(floorsWithIndex ?? []),
    updateSearch: mockUpdateSearch,
  }
})
