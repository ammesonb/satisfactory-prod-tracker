import { vi } from 'vitest'
import { ref } from 'vue'
import type { ItemOption } from '@/types/data'

/**
 * Mock type for useSelection composable return value
 */
export type MockUseSelection = {
  allSelected: { value: boolean }
  someSelected: { value: boolean }
  toggleAll: ReturnType<typeof vi.fn>
  toggleItem: ReturnType<typeof vi.fn>
  isSelected: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useSelection composable
 */
export const createMockUseSelection = (): MockUseSelection => ({
  allSelected: ref(false),
  someSelected: ref(false),
  toggleAll: vi.fn(),
  toggleItem: vi.fn(),
  isSelected: vi.fn(() => false),
})

/**
 * Mock type for useDataSearch composable return value
 */
export type MockUseDataSearch = {
  searchInput: { value: string }
  filteredItems: { value: ItemOption[] }
  updateSearch: ReturnType<typeof vi.fn>
}

/**
 * Creates a default mock for useDataSearch composable
 */
export const createMockUseDataSearch = (items: ItemOption[] = []): MockUseDataSearch => ({
  searchInput: ref(''),
  filteredItems: ref(items),
  updateSearch: vi.fn(),
})
