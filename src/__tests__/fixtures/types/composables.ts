import { vi } from 'vitest'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { ItemOption } from '@/types/data'

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
