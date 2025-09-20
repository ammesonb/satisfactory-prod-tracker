import { vi } from 'vitest'
import { ref } from 'vue'

export const mockSearchInput = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockFilteredItems = ref<any[]>([])
export const mockUpdateSearch = vi.fn((value: string) => {
  mockSearchInput.value = value
})

export const mockUseDataSearch = vi.fn(() => ({
  searchInput: mockSearchInput,
  filteredItems: mockFilteredItems,
  updateSearch: mockUpdateSearch,
}))
